import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";

const response = {
  200: {
    type: "object",
    properties: {
      transaction: { type: "string" },
    },
  },
} as const;

const getBodySchema = <GoCount extends number>(goCount: GoCount) => {
  return {
    type: "object",
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
    required: ["goProofs", "postHash"],
  } as const;
};

const getBodySchemaWithRep = <GoCount extends number>(goCount: GoCount) => {
  return {
    type: "object",
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
      repProof: {
        type: "object",
      },
    },
    required: ["goProofs", "postHash", "repProof"],
  } as const;
};

const root: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
  opts
): Promise<void> => {
  fastify.post(
    "/post",
    { schema: { response, body: getBodySchemaWithRep(10) } as const },
    async function (req, res) {
      req.body;
      return { root: true };
    }
  );

  fastify.post(
    "/comment",
    { schema: { response, body: getBodySchemaWithRep(5) } as const },
    async function (request, reply) {
      return { root: true };
    }
  );

  fastify.post(
    "/vote",
    { schema: { response, body: getBodySchema(1) } },
    async function (request, reply) {
      return { root: true };
    }
  );
};

export default root;
