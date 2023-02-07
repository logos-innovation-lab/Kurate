import { writable, type Writable } from 'svelte/store'

interface ChatData {
	unread: number
}

export type ChatStore = Writable<ChatData>

function createChatStore(): ChatStore {
	const store = writable<ChatData>({ unread: 3 })

	return store
}

export const chats = createChatStore()
