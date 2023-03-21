import {ethers} from "hardhat"
import {GlobalAnonymousFeed, GlobalAnonymousFeed__factory, Unirep__factory} from "../build/typechain"
import type {Signer} from "ethers/lib/ethers"
import {Circuit, Prover, SignupProof, BuildOrderedTree, CircuitConfig} from '@unirep/circuits'
import {SnarkProof, SnarkPublicSignals, Strategy, ZkIdentity, stringifyBigInts} from '@unirep/utils'
import {UserState, Synchronizer} from '@unirep/core'
import {defaultProver} from '@unirep/circuits/provers/defaultProver'
import { getUnirepContract, Unirep } from '@unirep/contracts'

const snarkjs = require('snarkjs');
const path = require('path');
const buildPath = path.join(process.cwd(), '../../node_modules/@unirep/circuits/zksnarkBuild/');

const {EPOCH_TREE_ARITY, EPOCH_TREE_DEPTH, FIELD_COUNT} = CircuitConfig.default;

const prover: Prover = {
    genProofAndPublicSignals: async (
      proofType: string | Circuit,
      inputs: any
    ): Promise<{
        proof: any,
        publicSignals: any
    }> => {
        const circuitWasmPath = buildPath + `${proofType}.wasm`
        const zkeyPath = buildPath + `${proofType}.zkey`
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          inputs,
          circuitWasmPath,
          zkeyPath
        )

        return { proof, publicSignals }
    },

    verifyProof: async (
      name: string | Circuit,
      publicSignals: SnarkPublicSignals,
      proof: SnarkProof
    ): Promise<boolean> => {
        const vkey = require(buildPath +  `${name}.vkey.json`)
        return snarkjs.groth16.verify(vkey, publicSignals, proof)
    },

    getVKey: async (name: string | Circuit): Promise<any> => {
        const vkey = require(buildPath +  `${name}.vkey.json`)
        return vkey;
    }
}

describe("Global Anonymous Feed Contract", () => {
    let postContract: GlobalAnonymousFeed
    let unirepContract: Unirep

    const groupId = 42
    const identitySeed = 'identity'
    let accounts: Signer[]
    let provider: any;
    const zkIdentity = new ZkIdentity(Strategy.SERIALIZED, '{"identityNullifier":"eadba25c151506b68aef691a6072b20a51d4030a5332e29483b10fa12c8ea7f6","identityTrapdoor":"e42266d7dd3b9702de1ec974c2741e347b5f6a9cadc4884d9dd9d20962f94b96","secret":["eadba25c151506b68aef691a6072b20a51d4030a5332e29483b10fa12c8ea7f6","e42266d7dd3b9702de1ec974c2741e347b5f6a9cadc4884d9dd9d20962f94b96"]}')


    before(async () => {
        provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_URL)
        const signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as string, provider)
        postContract = new GlobalAnonymousFeed__factory(signer).attach(process.env.GLOBAL_ANONYMOUS_FEED_ADDRESS as string);
        unirepContract = getUnirepContract('0x5e5384c3EA26185BADF41d6980397eB4D36b850e', signer);
        console.log(await postContract.attesterCurrentEpoch());
        console.log(await postContract.attesterEpochRemainingTime());
        console.log(buildPath);

    })

    describe("Global Anonymous Feed Contract", () => {
        it("Should allow users to create persona", async () => {
            // TODO: need to add getting for posts
            // TODO: need to change certains types from bytes32 to string
            // TODO: add ability to migrate admin
            // TODO: emit events for new post
            // console.log(await postContract.queryFilter(postContract.filters.NewPersonaPost()))

            const persona = await postContract.personas(42);
            console.log(persona);
            if (persona.personaId.toNumber() === 0) {
                await postContract["createPersona(uint256,string,string,string,bytes32,bytes32,bytes32[5])"](
                  42,
                  '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  [
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  ],
                  { gasLimit: 6721974 }
                );
            }
        });

        it("Should allow users to join a group", async () => {
            const circuitInputs = {
                attester_id: (await postContract.attesterId()).toString(),
                epoch: 0,
                identity_nullifier: '0xeadba25c151506b68aef691a6072b20a51d4030a5332e29483b10fa12c8ea7f6',
                identity_trapdoor: '0xe42266d7dd3b9702de1ec974c2741e347b5f6a9cadc4884d9dd9d20962f94b96',
            };

            const { proof, publicSignals } = await prover.genProofAndPublicSignals(
              Circuit.signup,
              circuitInputs
            );

            const signupProof = new SignupProof(publicSignals, proof);
            const memberSignedUp = await postContract.membersByPersona(42, signupProof.publicSignals[0]);

            console.log('idcommit', zkIdentity.genIdentityCommitment().toString())

            if (!memberSignedUp) {
                await postContract["joinPersona(uint256,uint256[],uint256[8])"](
                  42,
                  signupProof.publicSignals,
                  signupProof.proof,
                  { gasLimit: 6721974 }
                );
            }

        })
        //
        it("Should allow users to propose a post", async () => {
            console.log(await postContract.unirep())
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity)

            await state.sync.start();
            await state.waitForSync();
            console.log('has signed up', await state.hasSignedUp())
            const repProofs = await state.genProveReputationProof({});
            // await postContract["proposePost(uint256,bytes32)"](
            //   42,
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
            //   { gasLimit: 6721974 },
            // );
        })
        //
        // it("Should allow users to propose a comment", async () => {
        //     console.log(await postContract.unirep())
        //     const state = new UserState({
        //         prover: defaultProver, // a circuit prover
        //         attesterId: (await postContract.attesterId()).toBigInt(),
        //         unirepAddress: await postContract.unirep(),
        //         provider, // an ethers.js provider
        //     }, zkIdentity)
        //
        //     await state.sync.start();
        //     await state.waitForSync();
        //     console.log('hash signed up', await state.hasSignedUp())
        //     const repProofs = await state.genProveReputationProof({});
        //     // await postContract["proposeComment(uint256,bytes32)"](
        //     //   42,
        //     //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
        //     //   { gasLimit: 6721974 },
        //     // );
        // })
        //
        // it("Should allow users to vote", async () => {
        //     console.log(await postContract.unirep())
        //     const state = new UserState({
        //         prover: defaultProver, // a circuit prover
        //         attesterId: (await postContract.attesterId()).toBigInt(),
        //         unirepAddress: await postContract.unirep(),
        //         provider, // an ethers.js provider
        //     }, zkIdentity)
        //
        //     await state.sync.start();
        //     await state.waitForSync();
        //     console.log('hash signed up', await state.hasSignedUp())
        //     console.log(await postContract.attesterCurrentEpoch())
        //     console.log(await postContract.attesterEpochRemainingTime())
        //     const repProofs = await state.genProveReputationProof({
        //
        //     });
        //     console.log(repProofs);
        //     // await postContract.vote(
        //     //   42,
        //     //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
        //     //   true,
        //     //   repProofs.publicSignals,
        //     //   repProofs.proof,
        //     //   { gasLimit: 6721974 },
        //     // );
        // })

        it("Should tally vote", async () => {
            // console.log(await postContract.unirep())
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity)

            await state.sync.start();
            await state.waitForSync();

            const repProofs = await state.genProveReputationProof({ minRep: 5 });
            console.log(repProofs);
            // await postContract.grantReputation(10, repProofs.publicSignals, repProofs.proof,  { gasLimit: 6721974 });

            // console.log('hash signed up', await state.hasSignedUp())
            const epochKeyProof = await state.genEpochKeyProof();
            console.log('epochProof', epochKeyProof);
            // 0: 17728354178999301073371515482194745330493547547209297507880220090338173829563
            // const ust = await state.genUserStateTransitionProof({});
            // console.log(ust);
            // await postContract.userStateTransition(ust.publicSignals, ust.proof, { gasLimit: 6721974 });

            // const preimages = []
            // // for (let x = 0; x < EPOCH_TREE_ARITY ** EPOCH_TREE_DEPTH - 2; x++) {
            //     const epochKey = BigInt('17728354178999301073371515482194745330493547547209297507880220090338173829563');
            //     const count = 3;
            //     let totalRep = 10;
            //     const fieldIndex = 0;
            //     preimages.push([
            //         epochKey,
            //         ...Array(FIELD_COUNT)
            //           .fill(0)
            //           .map((_, i) => {
            //               if (i === fieldIndex) {
            //                   return totalRep
            //               } else return 0
            //           }),
            //     ])
            // // }
            // console.log(preimages);
            // const { sortedLeaves, leaves, circuitInputs } = BuildOrderedTree.buildInputsForLeaves(preimages);
            //
            // const { publicSignals, proof } = await prover.genProofAndPublicSignals(
            //   Circuit.buildOrderedTree,
            //   stringifyBigInts(circuitInputs)
            // )
            // const bot = new BuildOrderedTree(publicSignals, proof);
            // console.log(bot);
            //
            // console.log('verify', await defaultProver.verifyProof(Circuit.buildOrderedTree, publicSignals, proof));
            //
            // await postContract.sealEpoch(0, bot.publicSignals, bot.proof, { gasLimit: 6721974 })

            console.log(await postContract.attesterCurrentEpoch())
            console.log(await postContract.attesterEpochRemainingTime())
            // await postContract.vote(
            //   42,
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   true,
            //   repProofs.publicSignals,
            //   repProofs.proof,
            //   { gasLimit: 6721974 },
            // );
            // await postContract.finalizeEpochIfNeeded(0, {gasLimit: 6721974});
        })
    })
})
