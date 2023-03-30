import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { rlnRegistry, verifyProof } from "../services/rln";
import { getDefaultProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { GLOBAL_ANONYMOUS_FEED_ADDRESS, PRIVATE_KEY, RPC_URL } from "../config";
import { GlobalAnonymousFeed__factory } from "../abi";

// Config
enum MessageType {
  Post,
  Comment,
  Vote,
}

const goRequired = {
  [MessageType.Post]: 10,
  [MessageType.Comment]: 5,
  [MessageType.Vote]: 1,
};

const bigIntSchema = { type: "string", pattern: "^[0-9]+$" } as const;
const rlnProofSchema = {
  type: "object",
  additionalProperties: false,
  required: ["snarkProof", "epoch", "rlnIdentifier"],
  properties: {
    snarkProof: {
      type: "object",
      additionalProperties: false,
      required: ["proof", "publicSignals"],
      properties: {
        proof: {
          type: "object",
          additionalProperties: false,
          required: ["pi_a", "pi_b", "pi_c", "protocol", "curve"],
          properties: {
            pi_a: {
              type: "array",
              items: bigIntSchema,
              minContains: 3,
              maxContains: 3,
            },
            pi_b: {
              type: "array",
              items: {
                type: "array",
                items: bigIntSchema,
                minContains: 2,
                maxContains: 2,
              },
              minContains: 3,
              maxContains: 3,
            },
            pi_c: {
              type: "array",
              items: bigIntSchema,
              minContains: 3,
              maxContains: 3,
            },
            protocol: { const: "groth16" },
            curve: { const: "bn128" },
          },
        },
        publicSignals: {
          type: "object",
          additionalProperties: false,
          required: [
            "yShare",
            "merkleRoot",
            "internalNullifier",
            "signalHash",
            "externalNullifier",
          ],
          properties: {
            yShare: bigIntSchema,
            merkleRoot: bigIntSchema,
            internalNullifier: bigIntSchema,
            signalHash: bigIntSchema,
            externalNullifier: bigIntSchema,
          },
        },
      },
    },
    epoch: bigIntSchema,
    rlnIdentifier: bigIntSchema,
  },
} as const;

const repProofSchema = {
  type: "object",
  additionalProperties: false,
  required: ["publicSignals", "proof"],
  properties: {
    publicSignals: {
      type: "array",
      items: bigIntSchema,
      minContains: 8,
      maxContains: 8,
    },
    proof: {
      type: "array",
      items: bigIntSchema,
      minContains: 1,
    },
  },
} as const;

const response = {
  200: {
    type: "object",
    additionalProperties: false,
    required: ["transaction"],
    properties: {
      transaction: { type: "string" },
    },
  },
} as const;

const getBodySchemaWithRep = () => {
  return {
    type: "object",
    additionalProperties: false,
    required: ["personaId", "type", "postHash", "goProofs", "repProof"],
    properties: {
      personaId: bigIntSchema,
      type: { enum: [0, 1] },
      postHash: {
        type: "string",
      },
      goProofs: {
        type: "array",
        uniqueItems: true,
        items: rlnProofSchema,
      },
      repProof: repProofSchema,
    },
  } as const;
};

const getBodySchemaWithoutRep = () => {
  const schema = getBodySchemaWithRep();
  const { repProof, ...properties } = schema.properties;

  return {
    ...schema,
    required: ["personaId", "type", "postHash", "goProofs"],
    properties: {
      ...properties,
      type: { const: 2 },
    },
  } as const;
};

// TODO: Make the verification code more generic, but it's not easy type-wise
const root: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  const provider = getDefaultProvider(RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const feed = GlobalAnonymousFeed__factory.connect(
    GLOBAL_ANONYMOUS_FEED_ADDRESS,
    wallet
  );

  fastify.post(
    "/with-rep",
    { schema: { response, body: getBodySchemaWithRep() } } as const,
    async function ({ body }) {
      if (body.goProofs.length !== goRequired[body.type]) {
        throw new Error("wrong number of go proofs");
      }

      const { signalHash } = body.goProofs[0].snarkProof.publicSignals;

      // Make sure that the signal for each proof is identical
      // TODO: Also check nullifiers?
      // TODO: Make sure that ell the epochs are in the same interval
      // TODO: Check that internalNullifier === "kurate"
      for (const { snarkProof } of body.goProofs) {
        if (snarkProof.publicSignals.signalHash !== signalHash) {
          throw new Error("signalHashes different");
        }

        if (BigInt(snarkProof.publicSignals.merkleRoot) !== rlnRegistry.root) {
          throw new Error("wrong root hash");
        }
      }

      // Check all proofs
      await Promise.all(body.goProofs.map(verifyProof));

      // Post data on-chain
      const tx = await feed[
        "proposeMessage(uint256,uint8,bytes32,uint256[],uint256[8])"
      ](
        body.personaId,
        body.type,
        body.postHash,
        body.repProof.publicSignals,
        body.repProof.proof
      );

      // Return transaction hash
      return { transaction: tx.hash };
    }
  );

  fastify.post(
    "/without-rep",
    { schema: { response, body: getBodySchemaWithoutRep() } as const },
    async function ({ body }) {
      if (body.goProofs.length !== goRequired[body.type]) {
        throw new Error("wrong number of go proofs");
      }

      const { signalHash } = body.goProofs[0].snarkProof.publicSignals;

      // Make sure that the signal for each proof is identical
      // TODO: Also check nullifiers?
      // TODO: Make sure that ell the epochs are in the same interval
      // TODO: Check that internalNullifier === "kurate"
      for (const { snarkProof } of body.goProofs) {
        if (snarkProof.publicSignals.signalHash !== signalHash) {
          throw new Error("signalHashes different");
        }

        if (BigInt(snarkProof.publicSignals.merkleRoot) !== rlnRegistry.root) {
          throw new Error("wrong root hash");
        }
      }

      // Check all proofs
      await Promise.all(body.goProofs.map(verifyProof));

      // Post data on-chain
      const tx = await feed["proposeMessage(uint256,uint8,bytes32)"](
        body.personaId,
        body.type,
        body.postHash
      );

      // Return transaction hash
      return { transaction: tx.hash };
    }
  );
};

export default root;
