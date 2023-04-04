import type { Chat, DraftChat } from '$lib/stores/chat'
import type { DraftPersona, Persona } from '$lib/stores/persona'
import type { DraftPost, Post, PostPending } from '$lib/stores/post'

export function personaFromDB(persona: DBPersona, personaId: string): Persona {
	return {
		participantsCount: persona.participants.length,
		picture: persona.picture,
		minReputation: persona.minReputation,
		cover: persona.cover,
		name: persona.name,
		pitch: persona.pitch,
		description: persona.description,
		postsCount: persona.postsCount,
		timestamp: persona.timestamp,
		personaId,
	}
}

export function personaToDB(persona: DraftPersona, participants: string[]): DBPersona {
	return {
		cover: persona.cover,
		description: persona.description,
		minReputation: persona.minReputation,
		name: persona.name,
		postsCount: persona.posts.length,
		picture: persona.picture,
		pitch: persona.pitch,
		timestamp: persona.timestamp,
		participants,
	}
}

export function postDraftToDB(post: DraftPost, address: string): DBPostPending {
	return {
		...post,
		address,
		demote: [],
		promote: [],
	}
}

export function postPendingFromDB(
	post: DBPostPending,
	postId: string,
	address?: string,
): PostPending {
	let yourVote: '+' | '-' | undefined = undefined
	if (address && post.promote.includes(address)) yourVote = '+'
	if (address && post.demote.includes(address)) yourVote = '-'
	return {
		postId,
		yourVote,
		text: post.text,
		images: post.images,
		timestamp: post.timestamp,
		myPost: address === post.address,
	}
}

export function postFromDB(post: DBPost, postId: string, address?: string): Post {
	return {
		postId,
		text: post.text,
		timestamp: post.timestamp,
		images: post.images,
		myPost: address === post.address,
	}
}

export function chatToDB(chat: DraftChat, address: string, postAddress: string): DBChat {
	return {
		users: [address, postAddress],
		personaId: chat.persona.personaId,
		post: {
			postId: chat.post.postId,
			address: postAddress,
			images: chat.post.images,
			text: chat.post.text,
			timestamp: chat.post.timestamp,
		},
		messages: [],
	}
}

export function chatFromDB(chat: DBChat, persona: Persona, chatId: string): Chat {
	return {
		chatId,
		users: chat.users,
		persona: persona,
		post: {
			postId: chat.post.postId,
			images: chat.post.images,
			text: chat.post.text,
			timestamp: chat.post.timestamp,
		},
		messages: chat.messages,
	}
}
