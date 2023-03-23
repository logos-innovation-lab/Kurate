import { Provider } from "@ethersproject/abstract-provider";
import { readFileSync } from "fs";
import { join } from "path";
import { RLN, Registry, RLNFullProof, Cache } from "rlnjs";
import { GlobalAnonymousFeed__factory } from "../abi";
import { NewIdentityEvent } from "../abi/GlobalAnonymousFeed";
import { TypedListener } from "../abi/common";
import { GLOBAL_ANONYMOUS_FEED_ADDRESS } from "../config";
import { BigNumber } from "ethers";
import { Status } from "rlnjs/dist/types/cache";

// Configuration
export const MERKLE_TREE_DEPTH = 20;
export const CACHE_LENGTH = 10_000;

// Configuration files
const zkeyFilesPath = "./zkeyFiles";
const vkeyPath = join(zkeyFilesPath, "verification_key.json");
const vKey = JSON.parse(readFileSync(vkeyPath, "utf-8"));

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

// Instantiate RLN
export const rlnRegistry = new Registry(MERKLE_TREE_DEPTH);
export const caches = new Map<bigint, Cache>();

// Sync groups
// TODO: Avoid race conditions by listening to events before querying past ones,
// then checking blockNumber and transactionIndex to make sure the event wasn't
// processed already.
export const syncGroup = async (provider: Provider) => {
  const feed = GlobalAnonymousFeed__factory.connect(
    GLOBAL_ANONYMOUS_FEED_ADDRESS,
    provider
  );

  const filter = feed.filters.NewIdentity();

  // Fetch past events
  const identities = await feed.queryFilter(filter);
  for (const { args } of identities) {
    rlnRegistry.addMember(args.identityCommitment.toBigInt());
  }

  // Keep registry in sync by listening to on-chain events
  const listener: TypedListener<NewIdentityEvent> = (
    identityCommitment: BigNumber
  ) => {
    rlnRegistry.addMember(identityCommitment.toBigInt());
  };

  feed.on<NewIdentityEvent>(filter, listener);

  return () => {
    feed.off<NewIdentityEvent>(filter, listener);
  };
};

// Verify proof
export const verifyProof = async (proof: RLNFullProof) => {
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

  if (result.status === Status.INVALID) {
    throw new InvalidProofError();
  }

  if (result.status === Status.BREACH) {
    // NOTE: This should never happen
    if (!result.secret) {
      throw new Error("no secret revealed despite proof breach");
    }
    throw new ProofBreachError(result.secret);
  }
};
