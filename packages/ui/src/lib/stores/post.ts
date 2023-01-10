import { writable, type Writable } from 'svelte/store'
import type { User } from './user'
import { browser } from '$app/environment'
import type { FullProof } from '@semaphore-protocol/proof'

export interface Post {
	timestamp: number
	text: string
	user: User
	proof: FullProof
}

export interface PostStore extends Writable<Post[]> {
	add: (post: Post) => void
	reset: () => void
}

function createPostStore(): PostStore {
	let msgs: Post[] = []
	if (browser) {
		const messages = localStorage.getItem('messages')

		if (messages) {
			msgs = JSON.parse(messages)
		}
	}
	const store = writable<Post[]>(msgs)

	return {
		...store,
		add: (post: Post) => {
			store.update((posts) => {
				const newPosts = [post, ...posts]

				if (browser) {
					localStorage.setItem('messages', JSON.stringify(newPosts))
				}

				return newPosts
			})
		},
		reset: () => {
			store.set([])
		},
	}
}

export const posts = createPostStore()
