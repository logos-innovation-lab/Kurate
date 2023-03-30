import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { rlnRegistry, verifyProof } from "../services/rln";
import { getDefaultProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { GLOBAL_ANONYMOUS_FEED_ADDRESS, PRIVATE_KEY, RPC_URL } from "../config";
import { GlobalAnonymousFeed__factory } from "../abi";

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

const getBodySchema = <GoCount extends number>(goCount: GoCount) => {
  return {
    type: "object",
    additionalProperties: false,
    required: ["goProofs", "postHash"],
    properties: {
      goProofs: {
        type: "array",
        uniqueItems: true,
        minItems: goCount,
        maxItems: goCount,
        items: {
          type: "object",
        },
      },
      postHash: {
        type: "string",
      },
    },
  } as const;
};

const getBodySchemaWithRep = <GoCount extends number>(goCount: GoCount) => {
  return {
    type: "object",
    additionalProperties: false,
    required: ["personaId", "postHash", "goProofs", "repProof"],
    properties: {
      personaId: bigIntSchema,
      postHash: {
        type: "string",
      },
      goProofs: {
        type: "array",
        uniqueItems: true,
        minItems: goCount,
        maxItems: goCount,
        items: rlnProofSchema,
      },
      repProof: repProofSchema,
    },
  } as const;
};

enum MessageType {
  Post,
  Comment,
}

const root: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
  opts
): Promise<void> => {
  const provider = getDefaultProvider(RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const feed = GlobalAnonymousFeed__factory.connect(
    GLOBAL_ANONYMOUS_FEED_ADDRESS,
    wallet
  );

  fastify.post(
    "/post",
    { schema: { response, body: getBodySchemaWithRep(10) } } as const,
    async function ({ body }, res) {
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
        MessageType.Post,
        body.postHash,
        body.repProof.publicSignals,
        body.repProof.proof
      );

      // Return transaction hash
      return { transaction: tx.hash };
    }
  );

  fastify.post(
    "/comment",
    { schema: { response, body: getBodySchemaWithRep(5) } as const },
    async function (request, reply) {
      request.body;
      return { transaction: "" };
    }
  );

  fastify.post(
    "/vote",
    { schema: { response, body: getBodySchema(1) } },
    async function (request, reply) {
      return { transaction: "" };
    }
  );
};

export default root;
