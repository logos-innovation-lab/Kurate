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
    required: ["goProofs", "postHash", "repProof"],
    properties: {
      goProofs: {
        type: "array",
        uniqueItems: true,
        minItems: goCount,
        maxItems: goCount,
        items: rlnProofSchema,
      },
      postHash: {
        type: "string",
      },
      repProof: {
        type: "object",
      },
    },
  } as const;
};

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
    async function (req, res) {
      const { signalHash } = req.body.goProofs[0].snarkProof.publicSignals;

      // Make sure that the signal for each proof is identical
      // TODO: Also check nullifiers?
      for (const { snarkProof } of req.body.goProofs) {
        if (snarkProof.publicSignals.signalHash !== signalHash) {
          throw new Error("signalHashes different");
        }

        if (BigInt(snarkProof.publicSignals.merkleRoot) !== rlnRegistry.root) {
          throw new Error("wrong root hash");
        }
      }

      // Check all proofs
      await Promise.all(req.body.goProofs.map(verifyProof));

      // TODO: Post data on-chain (waiting for contract to get merged)

      // Return transaction hash
      return { transaction: "" };
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
