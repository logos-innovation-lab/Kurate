import { writable, type Writable } from 'svelte/store'
import type { User } from './user'
import type { providers } from 'ethers'

export interface Profile {
	signer?: providers.JsonRpcSigner
	identities: User[]
}

export type ProfileStore = Writable<Profile>

function createProfileStore(): ProfileStore {
	return writable<Profile>({ identities: [] })
}

export const profile = createProfileStore()
