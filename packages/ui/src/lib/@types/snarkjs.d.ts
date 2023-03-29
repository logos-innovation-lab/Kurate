declare module 'snarkjs' {
	// FIXME: use correct types
	export type PublicSignals = unknown
	export interface FullProve {
		publicSignals: PublicSignals
		proof: string
	}
	export class groth16 {
		static async verify(
			vkey: unknown,
			publicSignals: PublicSignals,
			proof: unknown,
		): Promise<boolean>
		static async fullProve(inputs: unknown, wasm: Uint8Array, zkey: Uint8Array): Promise<FullProve>
	}
}
