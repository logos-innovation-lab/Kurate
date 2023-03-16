import {ethers} from "hardhat"
import {GlobalAnonymousFeed, GlobalAnonymousFeed__factory, Unirep__factory} from "../build/typechain"
import type {Signer} from "ethers/lib/ethers"
import {Circuit, Prover, SignupProof} from '@unirep/circuits'
import {SnarkProof, SnarkPublicSignals, Strategy, ZkIdentity} from '@unirep/utils'
import {UserState, Synchronizer} from '@unirep/core'
import {defaultProver} from '@unirep/circuits/provers/defaultProver'
import { getUnirepContract, Unirep } from '@unirep/contracts'

const snarkjs = require('snarkjs');
const path = require('path');
const buildPath = path.join(process.cwd(), '../../node_modules/@unirep/circuits/zksnarkBuild/');

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

    describe("createPersona", () => {
        it("Should allow users to create persona", async () => {
            // TODO: need to add getting for posts
            // TODO: need to change certains types from bytes32 to string
            // TODO: add ability to migrate admin
            // TODO: emit events for new post

            console.log(await postContract.attesterId())
            // console.log(await postContract.queryFilter(postContract.filters.NewPersonaPost()))

            // await postContract["createPersona(uint256,string,string,string,bytes32,bytes32,bytes32[5])"](
            //   42,
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   [
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //     '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
            //   ],
            //   { gasLimit: 6721974 }
            // );
            const persona = await postContract.personas(42);
            console.log(persona);
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
            console.log(signupProof);
            // await postContract["joinPersona(uint256,uint256[],uint256[8])"](
            //   42,
            //   signupProof.publicSignals,
            //   signupProof.proof,
            //   { gasLimit: 6721974 }
            // );
            console.log(zkIdentity.genIdentityCommitment().toString())
            console.log(await postContract.membersByPersona(42, signupProof.publicSignals[0]))
        })

        it("Should allow users to propose a post", async () => {
            console.log(await postContract.unirep())
            // const synchronizer = new Synchronizer({
            //     attesterId: (await postContract.attesterId()).toBigInt(),
            //     unirepAddress: await postContract.unirep(),
            //     prover: defaultProver,
            //     provider,
            // })
            const state = new UserState({
                prover: defaultProver, // a circuit prover
                attesterId: (await postContract.attesterId()).toBigInt(),
                unirepAddress: await postContract.unirep(),
                provider, // an ethers.js provider
            }, zkIdentity)

            await state.sync.start();
            await state.waitForSync();
            const repProofs = await state.genProveReputationProof({});
            await postContract.proposePost(
              42,
              '0x56904a481c9a7ff8e9b51310d8bd9a9b3e1f0c5ea3f82a58b070e0ceb888c685',
              repProofs.publicSignals,
              repProofs.proof,
              { gasLimit: 6721974 }
          )
        })
    })
})
