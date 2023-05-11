import {getDefaultProvider} from "@ethersproject/providers";
import {PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS, PRIVATE_KEY, PUBLIC_PROVIDER} from "../config";
import {Wallet} from "@ethersproject/wallet";
import {GlobalAnonymousFeed, GlobalAnonymousFeed__factory} from "../abi";
import {BuildOrderedTree, Circuit, CircuitConfig, Prover} from "@unirep/circuits";
import {SnarkProof, SnarkPublicSignals, stringifyBigInts} from '@unirep/utils'
import {getUnirepContract, Unirep} from '@unirep/contracts'
import {BigNumber} from "ethers";
const snarkjs = require('snarkjs');
const path = require('path');
const buildPath = path.join(process.cwd(), './node_modules/@unirep/circuits/zksnarkBuild/');
const {FIELD_COUNT} = CircuitConfig.default;

class EpochSealer {
  contract: GlobalAnonymousFeed;

  wallet: Wallet;
  unirep?: Unirep;

  lastEpochSealed: number = -1;

  attesterId?: BigNumber
  nextEpochEnd: number = 0;

  constructor() {
    const provider = getDefaultProvider(PUBLIC_PROVIDER);
    this.wallet = new Wallet(PRIVATE_KEY, provider);
    this.contract = GlobalAnonymousFeed__factory.connect(
      PUBLIC_GLOBAL_ANONYMOUS_FEED_ADDRESS,
      this.wallet
    );
  }

  async start() {
    this.unirep = getUnirepContract(await this.contract.unirep(), this.wallet);
    this.attesterId = await this.contract.attesterId()
    this.maybeSealEpoch()
  }

  async sealEpoch(epoch: number) {
    console.log('sealing epoch: ', epoch)

    const attestations = await this.unirep!.queryFilter(this.unirep!.filters.Attestation(
      epoch,
      null,
      this.attesterId!.toBigInt(),
    ));

    const mapping: any = {};

    for (let i = 0; i < attestations.length; i++) {
      const attestation = attestations[i];

      const epochKey = attestation.args.epochKey.toString();
      mapping[epochKey] = mapping[epochKey] || [
        attestation.args.epochKey.toString(),
        ...Array(FIELD_COUNT).fill(0),
      ];

      const fieldIndex = attestation.args.fieldIndex.toNumber();
      mapping[epochKey][fieldIndex + 1] = attestation.args.change.add(mapping[epochKey][fieldIndex + 1]);
    }

    const preimages = Object.values(mapping);

    console.log(`got ${preimages.length} attestation preimages for epoch ${epoch}`)
    const { circuitInputs } = BuildOrderedTree.buildInputsForLeaves(preimages);
    console.log('built inputs for ordered tree, generating proof')
    const { publicSignals, proof } = await prover.genProofAndPublicSignals(
      Circuit.buildOrderedTree,
      stringifyBigInts(circuitInputs),
    );

    console.log('generated proof for ordered tree')
    const bot = new BuildOrderedTree(publicSignals, proof);

    console.log('submitting sealEpoch tx')
    const tx = await this.contract.sealEpoch(epoch, bot.publicSignals, bot.proof, { gasLimit: 6721974 })

    console.log('submitted tx', tx)
  }

  maybeSealEpoch = async () => {
    if (Date.now() >= this.nextEpochEnd) {
      const currentEpoch = await this.contract.attesterCurrentEpoch()
      const remainingTime = await this.contract.attesterEpochRemainingTime()

      this.nextEpochEnd = Date.now() + (remainingTime.toNumber() * 1000)

      for (let i = this.lastEpochSealed + 1; i < currentEpoch.toNumber(); i++) {
        const epochSealed = await this.unirep!.attesterEpochSealed(this.attesterId!, i)
        if (!epochSealed) {
          await this.sealEpoch(i)
        } else {
          this.lastEpochSealed = i
          console.log(`epoched has sealed: `, i)
        }
      }
    } else {
      console.log('noop')
    }

    // try sealing epoch every minute
    // this is a noop when all epoch has sealed
    setTimeout(this.maybeSealEpoch, 60*1000)

  }
}

const epochSealer = new EpochSealer()

export default epochSealer


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

    console.log(circuitWasmPath)
    console.log(zkeyPath)
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