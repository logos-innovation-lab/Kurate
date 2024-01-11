import { ZkIdentity } from "@zk-kit/identity";
import { genExternalNullifier, RLN, RLNFullProof } from "@zk-kit/protocols";
import rlnVkey from "../../public/rln/rln-vkey.json";
import { sha256 } from "./crypto";

export const createRLNProof = async (
  wasmFilePath: string,
  finalZkeyPath: string,
  hash: string,
  zkIdentity: ZkIdentity,
  merklePath: any
) => {
  const identitySecretHash = zkIdentity.getSecretHash();
  const epoch = Date.now().toString();
  const externalNullifier = genExternalNullifier(epoch);
  const signal = hash;
  const rlnIdentifier = await sha256("zkpost");
  // const xShare = RLN.genSignalHash(signal);
  const witness = RLN.genWitness(
    identitySecretHash!,
    merklePath!,
    externalNullifier,
    signal,
    BigInt("0x" + rlnIdentifier)
  );

  return RLN.genProof(witness, wasmFilePath, finalZkeyPath);
};

export const verifyRLNProof = async (
  hash: string,
  group: string | null,
  proof: RLNFullProof
) => {
  const verified = await RLN.verifyProof(rlnVkey as any, proof);
  const signalHash = RLN.genSignalHash(hash);

  if (!verified) {
    return false;
  }

  if (!group) {
    return false;
  }

  if (signalHash !== BigInt(proof.publicSignals.signalHash)) {
    return false;
  }

  return true;
};
