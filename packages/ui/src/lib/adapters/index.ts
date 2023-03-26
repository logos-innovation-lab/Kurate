import type { DraftPersona, Persona } from '$lib/stores/persona'
import type { Signer } from 'ethers'
import type { Chat } from '$lib/stores/chat'
import { InMemoryAndIPFS } from './in-memory-and-ipfs'
import { ZkitterAdapter } from './zkitter'
import { ADAPTER } from '$lib/constants'

export interface Adapter {
	// This is run when the app is mounted and should start app wide subscriptions
	start?: () => Promise<void> | void
	// This is run when the app unmounts and should clear subscriptions
	stop?: () => Promise<void> | void

	// Sign's in user (asks to login with wallet)
	signIn: () => Promise<void>

	addPersonaToFavorite: (groupId: string, persona?: Persona) => Promise<void>
	removePersonaFromFavorite: (groupId: string, persona?: Persona) => Promise<void>
	addPersonaDraft: (draftPersona: DraftPersona) => Promise<number>
	updatePersonaDraft: (index: number, draftPersona: DraftPersona) => Promise<void>
	deleteDraftPersona: (index: number) => Promise<void>
	publishPersona(draftPersona: DraftPersona, signer: Signer): Promise<void>

	uploadPicture(picture: string): Promise<string>
	getPicture(cid: string): string

	publishPost(groupId: string, text: string, images: string[], signer: Signer): Promise<void>
	subscribePersonaPosts(groupId: string): Promise<() => unknown>
	voteOnPost(groupId: string, postId: number, vote: '+' | '-', signer: Signer): Promise<void>

	startChat(chat: Chat): Promise<number>
	sendChatMessage(chatId: number, text: string): Promise<void>
	subscribeToChat(chatId: number): () => void
}
let adapter: Adapter
if (ADAPTER === 'in-memory') adapter = new InMemoryAndIPFS() as Adapter
else adapter = new ZkitterAdapter() as Adapter

export default adapter
