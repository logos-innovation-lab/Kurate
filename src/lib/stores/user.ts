import { writable, type Writable } from 'svelte/store'

export interface User {
	name?: string
	address: string
	avatar?: string
}

export interface UserStore extends Writable<User[]> {
	add: (user: User) => void
	reset: () => void
	find: (address: string) => Promise<User | undefined>
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
		find: (address: string) =>
			new Promise((resolve) => {
				store.subscribe((v) => {
					resolve(v.find((u) => u.address === address))
				})
			}),
	}
}

export const users = createUserStore()
