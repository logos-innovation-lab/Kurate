import { writable, type Writable } from 'svelte/store'
import type { Signer } from 'ethers'

export interface Profile {
	signer?: Signer
	address?: string
}

export type ProfileStore = Writable<Profile>

function createProfileStore(): ProfileStore {
	return writable<Profile>({})
}

export const profile = createProfileStore()
