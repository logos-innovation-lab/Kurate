// Types
import type { BigNumberish, FullProof, Proof, PublicSignals } from '@semaphore-protocol/proof'
import type {
	FullProof as ProtoFullProof,
	Proof as ProtoProof,
	PublicSignals as ProtoPublicSignals,
} from '$lib/protos/proof'
import { bigintToBuf, bufToBigint } from 'bigint-conversion'

const bigNumberishToUint8Array = (number: BigNumberish) => {
	return bigintToBuf(BigInt(number)) as Uint8Array
}

export const fullProofToProto = ({ proof, publicSignals }: FullProof): ProtoFullProof => {
	return {
		proof: proofToProto(proof),
		publicSignals: publicSignalsToProto(publicSignals),
	}
}

export const fullProofFromProto = (fullProof: ProtoFullProof): FullProof => {
	if (!fullProof.proof || !fullProof.publicSignals) {
		throw new Error('invalid full proof')
	}

	return {
		proof: proofFromProto(fullProof.proof),
		publicSignals: publicSignalsFromProto(fullProof.publicSignals),
	}
}

export const proofToProto = (proof: Proof): ProtoProof => {
	// TODO: Somehow pack those BigNumberish (partially 2d) arrays to bytes
	return {
		protocol: proof.protocol,
		curve: proof.curve,
		piA: new Uint8Array([]),
		piB: new Uint8Array([]),
		piC: new Uint8Array([]),
	}
}

export const proofFromProto = (proof: ProtoProof): Proof => {
	// TODO: Somehow unpack those BigNumberish (partially 2d) arrays from bytes
	return {
		protocol: proof.protocol,
		curve: proof.curve,
		pi_a: [],
		pi_b: [],
		pi_c: [],
	}
}

export const publicSignalsToProto = (publicSignals: PublicSignals): ProtoPublicSignals => {
	return {
		merkleTreeRoot: bigNumberishToUint8Array(publicSignals.merkleTreeRoot),
		nullifierHash: bigNumberishToUint8Array(publicSignals.nullifierHash),
		signalHash: bigNumberishToUint8Array(publicSignals.signalHash),
		externalNullifier: bigNumberishToUint8Array(publicSignals.externalNullifier),
	}
}

export const publicSignalsFromProto = (publicSignals: ProtoPublicSignals): PublicSignals => {
	return {
		merkleTreeRoot: bufToBigint(publicSignals.merkleTreeRoot),
		nullifierHash: bufToBigint(publicSignals.nullifierHash),
		signalHash: bufToBigint(publicSignals.signalHash),
		externalNullifier: bufToBigint(publicSignals.externalNullifier),
	}
}
