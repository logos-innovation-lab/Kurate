import { writable, type Writable } from 'svelte/store'

export interface Message {
	timestamp: number
	text: string
	address?: string
}

export interface Chat {
	postHash: string
	messages: Message[]
	closed?: boolean
}

interface ChatData {
	loading: boolean
	unread: number
	chats: Map<string, Chat>
}

export type ChatStore = Writable<ChatData>

function createChatStore(): ChatStore {
	const store = writable<ChatData>({ loading: true, unread: 0, chats: new Map<string, Chat>() })

	return store
}

export const chats = createChatStore()
