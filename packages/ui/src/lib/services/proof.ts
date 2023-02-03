import { bigintToBuf, bufToBigint } from 'bigint-conversion'

// Types
import type { BigNumberish, FullProof, Proof } from '@semaphore-protocol/proof'
import type { FullProof as ProtoFullProof } from '$lib/protos/proof'

export type ProofProto = [
	Uint8Array,
	Uint8Array,
	Uint8Array,
	Uint8Array,
	Uint8Array,
	Uint8Array,
	Uint8Array,
	Uint8Array,
]

export type WithFullProof<Type> = Type & { fullProof: FullProof }

export const bigNumberishToUint8Array = (number: BigNumberish): Uint8Array => {
	return new Uint8Array(bigintToBuf(BigInt(number), true))
}

export const fullProofToProto = (fullProof: FullProof): ProtoFullProof => {
	return {
		proof: proofToProto(fullProof.proof),
		merkleTreeRoot: bigNumberishToUint8Array(fullProof.merkleTreeRoot),
		nullifierHash: bigNumberishToUint8Array(fullProof.nullifierHash),
		signal: bigNumberishToUint8Array(fullProof.signal),
		externalNullifier: bigNumberishToUint8Array(fullProof.externalNullifier),
	}
}

export const fullProofFromProto = (fullProof: ProtoFullProof): FullProof => {
	if (fullProof.proof.length !== 8) {
		throw new Error('invalid full proof')
	}

	return {
		proof: proofFromProto(fullProof.proof as ProofProto),
		merkleTreeRoot: bufToBigint(fullProof.merkleTreeRoot),
		nullifierHash: bufToBigint(fullProof.nullifierHash),
		signal: bufToBigint(fullProof.signal),
		externalNullifier: bufToBigint(fullProof.externalNullifier),
	}
}

export const proofToProto = (proof: Proof): ProofProto => {
	return proof.map(bigNumberishToUint8Array) as ProofProto
}

export const proofFromProto = (proof: ProofProto): Proof => {
	return proof.map(bufToBigint) as Proof
}
