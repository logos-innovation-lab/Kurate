import { Strategy, ZkIdentity as UnirepIdentity } from '@unirep/utils'
import type { Signer } from 'ethers'
import type { Circuit, Prover } from '@unirep/circuits'
import type { SnarkProof, SnarkPublicSignals } from '@unirep/utils'
import type { ZkIdentity } from '@zk-kit/identity'
import {generateMerkleTree} from "@zk-kit/protocols";
import type {Proof, ProofType} from "zkitter-js";

export const prover: Prover = {
	verifyProof: async (
		circuitName: string | Circuit,
		publicSignals: SnarkPublicSignals,
		proof: SnarkProof,
	) => {
		const snarkjs = await import('snarkjs')
		const url = new URL(`/${circuitName}.vkey.json`, 'http://localhost:3000')
		const vkey = await fetch(url.toString()).then((r) => r.json())
		return snarkjs.groth16.verify(vkey, publicSignals, proof)
	},
	genProofAndPublicSignals: async (circuitName: string | Circuit, inputs: unknown) => {
		const snarkjs = await import('snarkjs')
		const wasmUrl = new URL(`/${circuitName}.wasm`, 'http://localhost:3000')
		const wasm = await fetch(wasmUrl.toString()).then((r) => r.arrayBuffer())
		const zkeyUrl = new URL(`/${circuitName}.zkey`, 'http://localhost:3000')
		const zkey = await fetch(zkeyUrl.toString()).then((r) => r.arrayBuffer())
		const { proof, publicSignals } = await snarkjs.groth16.fullProve(
			inputs,
			new Uint8Array(wasm),
			new Uint8Array(zkey),
		)
		return { proof, publicSignals }
	},
	getVKey: async (name: string | Circuit): Promise<string> => {
		return new URL(`/${name}.vkey.json`, 'http://localhost:3000').toString()
	},
}

export async function createIdentity(
	signer: Signer,
	nonce = 0,
): Promise<{
	ecdsa: { pub: string; priv: string }
	zkIdentity: ZkIdentity
	unirepIdentity: UnirepIdentity
}> {
	const { generateP256FromSeed, generateZKIdentityWithP256 } = await import('zkitter-js')

	const seed = await signer.signMessage(
		`Sign this message to generate a ECDSA with key nonce: ${nonce}`,
	)
	const keyPair = await generateP256FromSeed(seed)

	const zkIdentity = await generateZKIdentityWithP256(keyPair.priv, nonce)
	const nullifier = zkIdentity.getNullifier().toString(16)
	const trapdoor = zkIdentity.getTrapdoor().toString(16)
	const unirepIdentity = new UnirepIdentity(
		Strategy.SERIALIZED,
		`{"identityNullifier":"${nullifier}","identityTrapdoor":"${trapdoor}","secret":["${nullifier}","${trapdoor}"]}`,
	)

	return {
		zkIdentity: zkIdentity,
		unirepIdentity: unirepIdentity,
		ecdsa: keyPair,
	}
}

export async function generateRLNProofForNewPersona(hash: string, zkIdentity: ZkIdentity, newPersonaId: number | string): Promise<Proof> {
	const {createRLNProof, generateECDHKeyPairFromZKIdentity} = await import("zkitter-js")
	const idcommit = zkIdentity.genIdentityCommitment()
	const tree = generateMerkleTree(15, BigInt(0), [idcommit])
	const path = tree.createProof(tree.indexOf(idcommit))
	const proof = await createRLNProof(hash, zkIdentity, path)
	const ecdh = await generateECDHKeyPairFromZKIdentity(zkIdentity, hash)
	return {
		ecdh: ecdh.pub,
		groupId: `kurate_${newPersonaId}`,
		proof,
		type: 'rln' as ProofType.rln,
	}
}
