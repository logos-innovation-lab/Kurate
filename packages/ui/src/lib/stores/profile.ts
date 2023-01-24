import { writable, type Writable } from 'svelte/store'
import type { Signer } from 'ethers'
import type { Identity } from '@semaphore-protocol/identity'

export interface Profile {
	signer?: Signer
	identities: Record<string, Identity>
}

export type ProfileStore = Writable<Profile>

function createProfileStore(): ProfileStore {
	return writable<Profile>({ identities: {} })
}

export const profile = createProfileStore()
