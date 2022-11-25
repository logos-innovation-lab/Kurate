import { writable, type Writable } from 'svelte/store'
import type { User } from './user'

export interface Message {
	timestamp: Date
	text: string
	user: User
}

export interface MessageStore extends Writable<Message[]> {
	add: (message: Message) => void
	reset: () => void
}

function createMessageStore(): MessageStore {
	const store = writable<Message[]>([])

	return {
		...store,
		add: (message: Message) => {
			store.update((messages) => [...messages, message])
		},
		reset: () => {
			store.set([])
		},
	}
}

export const messages = createMessageStore()
