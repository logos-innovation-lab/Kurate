import { writable, type Writable } from 'svelte/store'
import type { User } from './user'

export interface Post {
	timestamp: number
	text: string
	user: User
}

export interface PostStore extends Writable<Post[]> {
	add: (post: Post) => void
	reset: () => void
}

function createPostStore(): PostStore {
	const store = writable<Post[]>([])

	return {
		...store,
		add: (post: Post) => {
			store.update((posts) => [...posts, post])
		},
		reset: () => {
			store.set([])
		},
	}
}

export const posts = createPostStore()
