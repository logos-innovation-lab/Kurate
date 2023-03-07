import { writable, type Writable } from 'svelte/store'
import type { Post } from './post'
import type { Persona } from './persona'

interface Message {
	timestamp: number
	text: string
	myMessage?: boolean
}

export interface Chat {
	persona: Persona
	post: Post
	messages: Message[]
	closed?: boolean
	blocked?: boolean
}

interface ChatData {
	loading: boolean
	unread: number
	chats: Chat[]
	draft: Chat | undefined
}

export type ChatStore = Writable<ChatData>

function createChatStore(): ChatStore {
	const store = writable<ChatData>({ loading: true, unread: 0, chats: [], draft: undefined })

	return store
}

export const chats = createChatStore()
