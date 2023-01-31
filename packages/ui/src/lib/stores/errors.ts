import { writable, type Writable } from 'svelte/store'

export interface UserStore extends Writable<Error[]> {
	add: (error: Error) => void
}

function createErrorStore(): UserStore {
	const store = writable<Error[]>([])

	return {
		...store,
		add: (error: Error) => {
			store.update((errors) => [...errors, error])
		},
	}
}

export const errors = createErrorStore()
