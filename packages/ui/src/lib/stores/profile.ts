import { writable, type Writable } from 'svelte/store'
import type { Signer } from 'ethers'
import type { ZkIdentity } from '@zk-kit/identity'

export interface Profile {
	signer?: Signer
	address?: string
	ecdh?: {
		priv: string
		pub: string
	}
	zkIdentity?: ZkIdentity
}

export type ProfileStore = Writable<Profile>

function createProfileStore(): ProfileStore {
	return writable<Profile>({})
}

export const profile = createProfileStore()
