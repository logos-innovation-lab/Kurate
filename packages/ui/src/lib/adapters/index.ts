import type { DraftPersona, Persona } from '$lib/stores/persona'
import type { Signer } from 'ethers'
import type { DraftChat } from '$lib/stores/chat'
import { ZkitterAdapter } from './zkitter'
import { Firebase } from './firebase'
import { ADAPTER } from '$lib/constants'
import { getFromLocalStorage } from '$lib/utils'
import { ZkitterAdapterGodMode } from './zkitter-god-mode'

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
	publishPersona(draftPersona: DraftPersona, signer: Signer): Promise<string>

	uploadPicture(picture: string): Promise<string>
	getPicture(cid: string): string

	publishPost(groupId: string, text: string, images: string[], signer: Signer): Promise<string>
	subscribePersonaPosts(groupId: string): Promise<() => unknown>
	voteOnPost(groupId: string, postId: string, vote: '+' | '-', signer: Signer): Promise<void>

	startChat(chat: DraftChat): Promise<string>
	sendChatMessage(chatId: string, text: string): Promise<void>
	subscribeToChat?: (chatId: string) => Promise<() => void>
}

export const adapters = ['zkitter', 'firebase', 'zkitter-god-mode'] as const
export type AdapterName = (typeof adapters)[number]
export const adapterName: AdapterName = getFromLocalStorage<AdapterName>(
	'adapter',
	ADAPTER as AdapterName,
)

let adapter: Adapter
switch (adapterName) {
	case 'zkitter':
		adapter = new ZkitterAdapter()
		break
	case 'firebase':
		adapter = new Firebase()
		break
	case 'zkitter-god-mode':
		adapter = new ZkitterAdapterGodMode()
		break
	default:
		throw new Error(`Invalid adapter ${ADAPTER}`)
}

export default adapter
