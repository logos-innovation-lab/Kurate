import { writable, type Writable } from 'svelte/store'
import type { User } from './user'

export interface Profile {
	key?: {
		publicKey: string
	}
	profiles: User[]
	active?: User
}

export interface ProfileStore extends Writable<Profile> {
	setActive: (user: User) => void
}

function createProfileStore(): ProfileStore {
	const store = writable<Profile>({ profiles: [], active: undefined })

	return {
		...store,
		setActive: (user: User) => {
			store.update((profile) => ({ ...profile, active: user }))
		},
	}
}

export const profile = createProfileStore()
