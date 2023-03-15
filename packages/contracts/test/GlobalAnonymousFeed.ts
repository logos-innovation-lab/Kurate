import { expect } from "chai"
import { solidityKeccak256 } from "ethers/lib/utils"
import { run, ethers } from "hardhat"
import { GlobalAnonymousFeed, GlobalAnonymousFeed__factory } from "../build/typechain"
import { config } from "../package.json"
import type { Signer } from "ethers/lib/ethers"
import { Circuit, Prover } from '@unirep/circuits'
import { SnarkProof, SnarkPublicSignals } from '@unirep/utils'

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

    const groupId = 42
    const identitySeed = 'identity'
    let accounts: Signer[]



    before(async () => {
        const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_URL)
        const signer = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY as string, provider)
        postContract = new GlobalAnonymousFeed__factory(signer).attach(process.env.GLOBAL_ANONYMOUS_FEED_ADDRESS as string);
        console.log(await postContract.attesterCurrentEpoch());
        console.log(await postContract.attesterEpochRemainingTime());
        console.log(buildPath);
        const circuitInputs = {
            attester_id: 42,
            epoch: 0,
            identity_nullifier: '0xeadba25c151506b68aef691a6072b20a51d4030a5332e29483b10fa12c8ea7f6',
            identity_trapdoor: '0xe42266d7dd3b9702de1ec974c2741e347b5f6a9cadc4884d9dd9d20962f94b96',
        };

        const { proof, publicSignals } = await prover.genProofAndPublicSignals(
          Circuit.signup,
          circuitInputs
        );

        console.log(proof, publicSignals);
    })

    describe("createPersona", () => {
        it("Should allow users to create persona", async () => {
            // TODO: need to add getting for posts
            // TODO: need to change certains types from bytes32 to string

            // await postContract.createPersona(
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
            //   [],
            //   [1,2,3,4,5,6,7,8]
            // );
            const persona = await postContract.personas(42);
            console.log(persona);
        });

        it("Should not allow users to join the group with the same identity", async () => {

        })
    })
})
