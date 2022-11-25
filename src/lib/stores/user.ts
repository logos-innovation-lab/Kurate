import { writable, type Writable } from 'svelte/store'

export interface User {
	name: string
	address: string
	profile: string
}

export interface UserStore extends Writable<User[]> {
	add: (user: User) => void
	reset: () => void
}

function createUserStore(): UserStore {
	const store = writable<User[]>([])

	return {
		...store,
		add: (user: User) => {
			store.update((users) => [...users, user])
		},
		reset: () => {
			store.set([])
		},
	}
}

export const users = createUserStore()
