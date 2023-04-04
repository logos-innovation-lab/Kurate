import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
// import { rlnRegistry, verifyProof } from "../services/rln";
import { getDefaultProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { GLOBAL_ANONYMOUS_FEED_ADDRESS, PRIVATE_KEY, RPC_URL } from "../config";
import { GlobalAnonymousFeed__factory } from "../abi";
import cors from '@fastify/cors'
const path = require('path')

// Config
// enum MessageType {
//   Post,
//   Comment,
//   Vote,
// }

// const goRequired: {[msgType: number]: number} = {
//   [MessageType.Post]: 10,
//   [MessageType.Comment]: 5,
//   [MessageType.Vote]: 1,
// };

const bigIntSchema = { type: "string", pattern: "^[0-9]+$" } as const;
// const rlnProofSchema = {
//   type: "object",
//   additionalProperties: false,
//   required: ["snarkProof", "epoch", "rlnIdentifier"],
//   properties: {
//     snarkProof: {
//       type: "object",
//       additionalProperties: false,
//       required: ["proof", "publicSignals"],
//       properties: {
//         proof: {
//           type: "object",
//           additionalProperties: false,
//           required: ["pi_a", "pi_b", "pi_c", "protocol", "curve"],
//           properties: {
//             pi_a: {
//               type: "array",
//               items: bigIntSchema,
//               // minContains: 3,
//               // maxContains: 3,
//             },
//             pi_b: {
//               type: "array",
//               items: {
//                 type: "array",
//                 items: bigIntSchema,
//                 // minContains: 2,
//                 // maxContains: 2,
//               },
//               // minContains: 3,
//               // maxContains: 3,
//             },
//             pi_c: {
//               type: "array",
//               items: bigIntSchema,
//               // minContains: 3,
//               // maxContains: 3,
//             },
//             protocol: { const: "groth16" },
//             curve: { const: "bn128" },
//           },
//         },
//         publicSignals: {
//           type: "object",
//           additionalProperties: false,
//           required: [
//             "yShare",
//             "merkleRoot",
//             "internalNullifier",
//             "signalHash",
//             "externalNullifier",
//           ],
//           properties: {
//             yShare: bigIntSchema,
//             merkleRoot: bigIntSchema,
//             internalNullifier: bigIntSchema,
//             signalHash: bigIntSchema,
//             externalNullifier: bigIntSchema,
//           },
//         },
//       },
//     },
//     epoch: bigIntSchema,
//     rlnIdentifier: bigIntSchema,
//   },
// } as const;

const repProofSchema = {
  type: "object",
  additionalProperties: false,
  required: ["publicSignals", "proof"],
  properties: {
    publicSignals: {
      type: "array",
      items: bigIntSchema,
      // minContains: 8,
      // maxContains: 8,
    },
    proof: {
      type: "array",
      items: bigIntSchema,
      // minContains: 1,
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
    required: [
      "personaId",
      "type",
      "postHash",
      // "goProofs",
      "repProof"
    ],
    properties: {
      personaId: bigIntSchema,
      type: { enum: [0, 1] },
      postHash: {
        type: "string",
      },
      // goProofs: {
      //   type: "array",
      //   uniqueItems: true,
      //   items: rlnProofSchema,
      // },
      repProof: repProofSchema,
    },
  } as const;
};

const createJoinBodySchemaWithRep = () => {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "name",
      "picture",
      "cover",
      "pitch",
      "description",
      "seedPostHashes",
      "signupProof",
      "signupSignals"
    ],
    properties: {
      name: { type: "string" },
      picture: { type: "string" },
      cover: { type: "string" },
      pitch: { type: "string" },
      description: { type: "string" },
      seedPostHashes: {
        type: "array",
        uniqueItems: true,
        items: { type: "string" },
      },
      signupSignals: {
        type: "array",
        items: bigIntSchema,
        // minContains: 8,
        // maxContains: 8,
      },
      signupProof: {
        type: "array",
        items: bigIntSchema,
        // minContains: 1,
      },
    },
  } as const;
};

const joinPersonaBodySchemaWithProof = () => {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "personaId",
      "signupProof",
      "signupSignals"
    ],
    properties: {
      personaId: { type: "number" },
      signupSignals: {
        type: "array",
        items: bigIntSchema,
        // minContains: 8,
        // maxContains: 8,
      },
      signupProof: {
        type: "array",
        items: bigIntSchema,
        // minContains: 1,
      },
    },
  } as const;
};

const voteBody = () => {
  return {
    type: "object",
    additionalProperties: false,
    required: ["postId", "isUpvote", "publicSignals", "proof"],
    properties: {
      postId: { type: "string" },
      isUpvote: { type: "boolean" },
      publicSignals: {
        type: "array",
        items: bigIntSchema,
        // minContains: 8,
        // maxContains: 8,
      },
      proof: {
        type: "array",
        items: bigIntSchema,
        // minContains: 1,
      },
    },
  } as const;
};

const ustBody = () => {
  return {
    type: "object",
    additionalProperties: false,
    required: ["publicSignals", "proof"],
    properties: {
      publicSignals: {
        type: "array",
        items: bigIntSchema,
        // minContains: 8,
        // maxContains: 8,
      },
      proof: {
        type: "array",
        items: bigIntSchema,
        // minContains: 1,
      },
    },
  } as const;
};

const getBodySchemaWithoutRep = () => {
  const schema = getBodySchemaWithRep();
  const {
    repProof,
    // goProofs,
    ...properties
  } = schema.properties;

  return {
    ...schema,
    // TODO: temporarily removing gotoken due to bug in rlnjs
    required: ["personaId", "type", "postHash"],
    properties: {
      ...properties,
      type: { enum: [0, 1, 2] },
    },
  } as const;
};

// TODO: Make the verification code more generic, but it's not easy type-wise
const root: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  console.log(RPC_URL)
  const provider = getDefaultProvider(RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const feed = GlobalAnonymousFeed__factory.connect(
    GLOBAL_ANONYMOUS_FEED_ADDRESS,
    wallet
  );

  console.log(path.join(__dirname, '../../node_modules/@unirep/circuits/zksnarkBuild'))
  fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../../node_modules/@unirep/circuits/zksnarkBuild'),
    prefix: '/circuits/',
    decorateReply: false
  })

  console.log(path.join(__dirname, '../assets/zkey-files'))
  fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../assets/zkey-files'),
    prefix: '/rln/',
    decorateReply: false
  })

  fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true)
        return
      }
      const hostname = new URL(origin as string).hostname
      if(hostname === "localhost"){
        //  Request from localhost will pass
        cb(null, true)
        return
      }
      // Generate an error on other origins, disabling access
      cb(new Error("Not allowed"), false)
    }
  })

  fastify.post(
    "/propose-message-with-rep",
    { schema: { response, body: getBodySchemaWithRep() } } as const,
    async function ({ body }: {body: any}) {
      // if (body.goProofs.length !== goRequired[body.type]) {
      //   throw new Error("wrong number of go proofs");
      // }

      // const { signalHash } = body.goProofs[0].snarkProof.publicSignals;

      // Make sure that the signal for each proof is identical
      // TODO: Also check nullifiers?
      // TODO: Make sure that ell the epochs are in the same interval
      // TODO: Check that internalNullifier === "kurate"
      // for (const { snarkProof } of body.goProofs) {
      //   if (snarkProof.publicSignals.signalHash !== signalHash) {
      //     throw new Error("signalHashes different");
      //   }
      //
      //   if (BigInt(snarkProof.publicSignals.merkleRoot) !== rlnRegistry.root) {
      //     throw new Error("wrong root hash");
      //   }
      // }

      // Check all proofs
      // await Promise.all(body.goProofs.map(verifyProof));

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
    "/propose-message-without-rep",
    { schema: { response, body: getBodySchemaWithoutRep() } as const },
    async function ({ body }: {body: any}) {
      // TODO: disabling go proof check due to bug in rlnjs
      // TODO: we should probably use zk-kit instead....
      // if (body.goProofs.length !== goRequired[body.type]) {
      //   throw new Error("wrong number of go proofs");
      // }
      // const { signalHash } = body.goProofs[0].snarkProof.publicSignals;

      // Make sure that the signal for each proof is identical
      // TODO: Also check nullifiers?
      // TODO: Make sure that ell the epochs are in the same interval
      // TODO: Check that internalNullifier === "kurate"
      // for (const { snarkProof } of body.goProofs) {
      //   if (snarkProof.publicSignals.signalHash !== signalHash) {
      //     throw new Error("signalHashes different");
      //   }

        // TODO: there seems to be a bug in rlnjs circuits that return incorrect merkleRoot
        // TODO: let's report bug in rlnjs repo
        // if (BigInt(snarkProof.publicSignals.merkleRoot) !== rlnRegistry.root) {
        //   throw new Error("wrong root hash");
        // }
      // }

      // Check all proofs
      // await Promise.all(body.goProofs.map(verifyProof));

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

  fastify.post(
    "/create-and-join-without-rep",
    { schema: { response, body: createJoinBodySchemaWithRep() } as const },
    async function ({ body }: {body: any}) {
      // Post data on-chain
      const tx = await feed['createAndJoinPersona(string,string,string,bytes32,bytes32,bytes32[5],uint256[],uint256[8])'](
        body.name,
        body.picture,
        body.cover,
        body.pitch,
        body.description,
        body.seedPostHashes,
        body.signupSignals,
        body.signupProof,
        { gasLimit: 6721974 },
      )

      // Return transaction hash
      return { transaction: tx.hash };
    }
  );

  fastify.post(
  "/join-persona",
    { schema: { response, body: joinPersonaBodySchemaWithProof() } as const },
    async function ({ body }: {body: any}) {
      const hasJoinedUnirep = await feed.members(body.signupSignals[0]);
      let tx;

      if (hasJoinedUnirep) {
        tx = await feed["joinPersona(uint256,uint256)"](
          body.personaId,
          body.signupSignals[0],
          { gasLimit: 6721974 },
        )
      } else {
        tx = await feed["joinPersona(uint256,uint256[],uint256[8])"](
          body.personaId,
          body.signupSignals,
          body.signupProof,
          { gasLimit: 6721974 },
        )
      }

      return { transaction: tx.hash };
    }
  )

  fastify.post(
  "/vote-on-post",
    { schema: { response, body: voteBody() } as const },
    async function ({ body }: {body: any}) {
      const tx = await feed.vote(
        body.postId,
        body.isUpvote,
        body.publicSignals,
        body.proof,
        { gasLimit: 6721974 },
      )

      return { transaction: tx.hash };
    }
  )

  fastify.post(
  "/user-state-transition",
    { schema: { response, body: ustBody() } as const },
    async function ({ body }: {body: any}) {
      const tx = await feed.userStateTransition(
        body.publicSignals,
        body.proof,
        { gasLimit: 6721974 },
      )

      return { transaction: tx.hash };
    }
  )
};

export default root;
