import { Provider } from "@ethersproject/abstract-provider";
import { readFileSync } from "fs";
import { join } from "path";
import { RLN, Registry, RLNFullProof, Cache, StrBigInt } from "rlnjs";
import { GlobalAnonymousFeed__factory } from "../abi";
import { NewPersonaMemberEvent } from "../abi/GlobalAnonymousFeed";
import { TypedListener } from "../abi/common";
import type { BigNumber } from "@ethersproject/bignumber";

// Configuration
export const MERKLE_TREE_DEPTH = 20;
export const CACHE_LENGTH = 10_000;

// Configuration files
const zkeyFilesPath = join(__dirname, "../assets/zkey-files");
const vkeyPath = join(zkeyFilesPath, "verification_key.json");
const vKey = JSON.parse(readFileSync(vkeyPath, "utf-8"));
const wasmFilePath = join(zkeyFilesPath, "rln.wasm");
const finalZkeyPath = join(zkeyFilesPath, "rln_final.zkey");

// Types
type CustomRLNFullProof = Omit<RLNFullProof, "epoch" | "rlnIdentifier"> & {
  epoch: StrBigInt;
  rlnIdentifier: StrBigInt;
};

// Errors
class InvalidProofError extends Error {
  constructor() {
    super("invalid proof");
  }
}

class ProofBreachError extends Error {
  constructor(public secret: bigint) {
    super("duplicate proof");
  }
}

class MerkleRootOutdated extends Error {
  constructor(public expected: bigint, public actual: bigint) {
    super("duplicate proof");
  }
}

// Instantiate RLN
export const rlnRegistry = new Registry(MERKLE_TREE_DEPTH);
export const caches = new Map<bigint, Cache>();

// Get instance
export const getInstance = () => new RLN(wasmFilePath, finalZkeyPath, vKey);

// Sync groups
// TODO: Avoid race conditions by listening to events before querying past ones,
// then checking blockNumber and transactionIndex to make sure the event wasn't
// processed already.
export const syncGroup = async (provider: Provider, address: string) => {
  const feed = GlobalAnonymousFeed__factory.connect(address, provider);
  const filter = feed.filters.NewPersonaMember();

  // Fetch past events
  const identities = await feed.queryFilter(filter);
  for (const { args } of identities) {
    const idcommitmentBn = args.identityCommitment.toBigInt()
    if (rlnRegistry.indexOf(idcommitmentBn) < 0) {
      rlnRegistry.addMember(idcommitmentBn)
    }
  }

  // Keep registry in sync by listening to on-chain events
  const listener: TypedListener<NewPersonaMemberEvent> = (
    _personaId: BigNumber,
    identityCommitment: BigNumber
  ) => {
    const idcommitmentBn = identityCommitment.toBigInt()
    if (rlnRegistry.indexOf(idcommitmentBn) < 0) {
      rlnRegistry.addMember(idcommitmentBn)
    }
  };

  feed.on<NewPersonaMemberEvent>(filter, listener);

  return () => {
    feed.off<NewPersonaMemberEvent>(filter, listener);
  };
};

// Converts a CustomRLNFullProof to RLNFullProof
const customToRlnProof = (proof: CustomRLNFullProof): RLNFullProof => {
  return {
    ...proof,
    epoch: BigInt(proof.epoch),
    rlnIdentifier: BigInt(proof.rlnIdentifier),
  };
};

// Verify proof
// TODO: Ask `rlnjs` to make `epoch` and `rlnIdentifier` a StrBigInt
export const verifyProof = async (customProof: CustomRLNFullProof) => {
  const proof = customToRlnProof(customProof);
  const valid = await RLN.verifySNARKProof(vKey, proof.snarkProof);
  if (!valid) {
    throw new InvalidProofError();
  }

  let cache = caches.get(proof.rlnIdentifier);
  if (!cache) {
    cache = new Cache(proof.rlnIdentifier, CACHE_LENGTH);
    caches.set(proof.rlnIdentifier, cache);
  }

  const result = cache.addProof(proof);

  if (result.status === "invalid") {
    throw new InvalidProofError();
  }

  if (result.status === "breach") {
    // NOTE: This should never happen
    if (!result.secret) {
      throw new Error("no secret revealed despite proof breach");
    }
    throw new ProofBreachError(result.secret);
  }

  const root = BigInt(proof.snarkProof.publicSignals.merkleRoot);
  if (root !== rlnRegistry.root) {
    throw new MerkleRootOutdated(rlnRegistry.root, root);
  }
};
