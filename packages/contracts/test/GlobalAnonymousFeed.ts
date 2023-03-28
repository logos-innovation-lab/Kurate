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
const buildPath = path.join(process.cwd(), './node_modules/@unirep/circuits/zksnarkBuild/');

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
    const zkIdentity2 = new ZkIdentity(Strategy.SERIALIZED, '{"identityNullifier":"6bd38cc008a35836c0c37496f709c6e0169c86c8a2cda7133f0729d8209380","identityTrapdoor":"eb8953d9665b258129dd8a745ed66a43f178fd1f787fc8bfc5d76c1f5f2fe4c2","secret":["6bd38cc008a35836c0c37496f709c6e0169c86c8a2cda7133f0729d8209380","eb8953d9665b258129dd8a745ed66a43f178fd1f787fc8bfc5d76c1f5f2fe4c2"]}')

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
            // TODO: need to add getters for posts
            // TODO: add ability to migrate admin

            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity)

            await state.sync.start();
            await state.waitForSync();

            const signupProof = await state.genUserSignUpProof();

            const persona = await postContract.personas(0);

            if (persona.name === '') {
                await postContract["createPersona(string,string,string,bytes32,bytes32,bytes32[5],uint256[],uint256[8])"](
                  'testing group',
                  'http://profile.image',
                  'http://cover.image',
                  '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  [
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                    '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
                  ],
                  signupProof.publicSignals,
                  signupProof.proof,
                  { gasLimit: 6721974 }
                );
            }
        });

        it("Should allow users to join a group", async () => {
            // const state = new UserState({
            //     prover: defaultProver, // a circuit prover
            //     attesterId: (await postContract.attesterId()).toBigInt(),
            //     unirepAddress: await postContract.unirep(),
            //     provider, // an ethers.js provider
            // }, zkIdentity)

            const state2 = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity2)

            // await state.sync.start();
            // await state.waitForSync();
            await state2.sync.start();
            await state2.waitForSync();

            // const signupProof = await state.genUserSignUpProof();
            // const memberSignedUp = await postContract.membersByPersona(0, signupProof.publicSignals[0]);
            //
            // if (!memberSignedUp) {
            //     await postContract["joinPersona(uint256,uint256[],uint256[8])"](
            //       0,
            //       signupProof.publicSignals,
            //       signupProof.proof,
            //       { gasLimit: 6721974 }
            //     );
            // }

            const signupProof2 = await state2.genUserSignUpProof();
            const memberSignedUp2 = await postContract.membersByPersona(0, signupProof2.publicSignals[0]);

            if (!memberSignedUp2) {
                await postContract["joinPersona(uint256,uint256[],uint256[8])"](
                  0,
                  signupProof2.publicSignals,
                  signupProof2.proof,
                  { gasLimit: 6721974 }
                );
            }
        });

        it('should be able to grant reputations', async () => {
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity);

            const state2 = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity2);

            await state.sync.start();
            await state.waitForSync();
            await state2.sync.start();
            await state2.waitForSync();

            const repProofs = await state.genProveReputationProof({});
            await postContract.grantReputation(100, repProofs.publicSignals, repProofs.proof,  { gasLimit: 6721974 });

            const repProofs2 = await state2.genProveReputationProof({});
            await postContract.grantReputation(50, repProofs2.publicSignals, repProofs2.proof,  { gasLimit: 6721974 });
        });

        it('should seal epoch with new attestations', async () => {
            const remainingTime = (await postContract.attesterEpochRemainingTime()).toNumber() + 5;
            console.log(remainingTime);
            for (let i = 0; i < remainingTime; i++) {
                await new Promise(r => setTimeout(r, 1000));
                console.log(remainingTime - i);
            }

            const attestations = await unirepContract.queryFilter(unirepContract.filters.Attestation(
              (await postContract.attesterCurrentEpoch()).toNumber(),
              null,
              (await postContract.attesterId()).toBigInt(),
            ));

            const preimages = [];
            let epoch = 0;

            for (let i = 0; i < attestations.length; i++) {
                const attestation = attestations[i];
                epoch = attestation.args.epoch.toNumber();

                preimages.push([
                    attestation.args.epochKey.toString(),
                    ...Array(FIELD_COUNT)
                      .fill(0)
                      .map((_, i) => {
                          if (i === attestation.args.fieldIndex.toNumber()) {
                              return attestation.args.change;
                          } else {
                              return 0;
                          }
                      }),
                ]);
            }

            const { circuitInputs } = BuildOrderedTree.buildInputsForLeaves(preimages);

            const { publicSignals, proof } = await prover.genProofAndPublicSignals(
              Circuit.buildOrderedTree,
              stringifyBigInts(circuitInputs),
            );

            const bot = new BuildOrderedTree(publicSignals, proof);
            await postContract.sealEpoch(epoch, bot.publicSignals, bot.proof, { gasLimit: 6721974 })
        });

        it("should transition user", async () => {
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity);

            const state2 = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity2);

            await state.sync.start();
            await state.waitForSync();
            await state2.sync.start();
            await state2.waitForSync();

            const ust = await state.genUserStateTransitionProof({});
            await postContract.userStateTransition(ust.publicSignals, ust.proof, { gasLimit: 6721974 });

            const ust2 = await state2.genUserStateTransitionProof({});
            await postContract.userStateTransition(ust2.publicSignals, ust2.proof, { gasLimit: 6721974 });
        });

        it("Should allow users to propose a post", async () => {
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity)

            await state.sync.start();
            await state.waitForSync();

            const repProofs = await state.genProveReputationProof({ minRep: 100 });

            await postContract["proposeMessage(uint256,uint8,bytes32,uint256[],uint256[8])"](
              0,
              0,
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 },
            );
        })

        it("Should allow users to propose a comment", async () => {
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity)

            await state.sync.start();
            await state.waitForSync();

            const repProofs = await state.genProveReputationProof({ minRep: 50 });

            await postContract["proposeMessage(uint256,uint8,bytes32,uint256[],uint256[8])"](
              0,
              1,
              '0x44444a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 },
            );
        })

        it("Should allow users to vote", async () => {
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity2)

            await state.sync.start();
            await state.waitForSync();

            console.log(await postContract.attesterCurrentEpoch());
            console.log(await postContract.attesterEpochRemainingTime());

            const repProofs = await state.genProveReputationProof({});

            await postContract.vote(
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              true,
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 }
            );

            await postContract.vote(
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              true,
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 }
            );

            await postContract.vote(
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              false,
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 }
            );

            await postContract.vote(
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              false,
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 }
            );

            await postContract.vote(
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              false,
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 }
            );

            await postContract.vote(
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              true,
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 }
            );

            await postContract.vote(
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c683',
              true,
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 }
            );
        });

        it("Should tally votes", async () => {
            const remainingTime = (await postContract.attesterEpochRemainingTime()).toNumber() + 5;
            console.log(remainingTime);
            for (let i = 0; i < remainingTime; i++) {
                await new Promise(r => setTimeout(r, 1000));
                console.log(remainingTime - i);
            }
            const attestations = await unirepContract.queryFilter(unirepContract.filters.Attestation(
              1,
              null,
              (await postContract.attesterId()).toBigInt(),
            ));

            const mapping: any = {};

            let epoch = 0;

            for (let i = 0; i < attestations.length; i++) {
                const attestation = attestations[i];
                epoch = attestation.args.epoch.toNumber();

                const epochKey = attestation.args.epochKey.toString();
                mapping[epochKey] = mapping[epochKey] || [
                    attestation.args.epochKey.toString(),
                    ...Array(FIELD_COUNT).fill(0),
                ];

                const fieldIndex = attestation.args.fieldIndex.toNumber();
                mapping[epochKey][fieldIndex + 1] = attestation.args.change.add(mapping[epochKey][fieldIndex + 1]);
            }

            const preimages = Object.values(mapping);
            console.log(preimages);
            const { circuitInputs } = BuildOrderedTree.buildInputsForLeaves(preimages);

            const { publicSignals, proof } = await prover.genProofAndPublicSignals(
              Circuit.buildOrderedTree,
              stringifyBigInts(circuitInputs),
            );

            const bot = new BuildOrderedTree(publicSignals, proof);
            await postContract.sealEpoch(epoch, bot.publicSignals, bot.proof, { gasLimit: 6721974 })
        })

        it("should transition user again", async () => {
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity);

            const state2 = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity2);

            await state.sync.start();
            await state2.sync.start();

            await state.waitForSync();
            await state2.waitForSync();

            const ust = await state.genUserStateTransitionProof({});
            await postContract.userStateTransition(ust.publicSignals, ust.proof, { gasLimit: 6721974 });

            const ust2 = await state2.genUserStateTransitionProof({});
            await postContract.userStateTransition(ust2.publicSignals, ust2.proof, { gasLimit: 6721974 });

            await state.waitForSync();
            await state2.waitForSync();

            console.log((await state.genProveReputationProof({ minRep: 105 })));
            console.log((await state2.genProveReputationProof({ minRep: 54 })));
        });
    })
})
