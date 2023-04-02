import { writable, type Writable } from 'svelte/store'
import type { Post } from './post'
import type { Persona } from './persona'

export interface Message {
	timestamp: number
	text: string
	address?: string
}

export interface DraftChat {
	persona: Persona
	post: Post
	messages: Message[]
	closed?: boolean
	chatId?: string
}

export interface Chat extends DraftChat {
	users: string[]
	chatId: string
}

interface ChatData {
	loading: boolean
	unread: number
	chats: Map<string, Chat>
}

export interface ChatStore extends Writable<ChatData> {
	saveChat: (chat: Chat) => void
}

function createChatStore(): ChatStore {
	const store = writable<ChatData>({ loading: true, unread: 0, chats: new Map<string, Chat>() })

	return {
		...store,
		saveChat: (chat: Chat) => {
			store.update(({ chats, unread }) => {
				const chatId = chat.chatId
				chats.set(chatId, chat)
				return { loading: false, unread, chats }
			})	
		}
	}
}

export const chats = createChatStore()
