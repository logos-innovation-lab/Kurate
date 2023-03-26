import { connectWallet } from '$lib/services'
import { chats, type Chat } from '$lib/stores/chat'
import { personas, type DraftPersona } from '$lib/stores/persona'
import { profile } from '$lib/stores/profile'
import { saveToLocalStorage } from '$lib/utils'
import { create } from 'ipfs-http-client'
import { CREATE_PERSONA_GO_PRICE } from '$lib/constants'
import { tokens } from '$lib/stores/tokens'
import { posts } from '$lib/stores/post'

import type { Adapter } from '..'
import type { Signer } from 'ethers'

const IPFS_AUTH =
	'Basic Mk5Nbk1vZUNSTWMyOTlCQjYzWm9QZzlQYTU3OjAwZTk2MmJjZTBkZmQxZWQxNGNhNmY1M2JiYjYxMTli'
const IPFS_GATEWAY = 'https://kurate.infura-ipfs.io/ipfs'

export class ZkitterAdapter implements Adapter {
	private ipfs = create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: IPFS_AUTH,
		},
	})

	async start() {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'start')
	}
	stop() {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'stop')
	}
	addPersonaToFavorite(groupId: string): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'addPersonaToFavorite')

		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew: string[] = [...favorite, groupId]

				saveToLocalStorage('favorite', favoriteNew)

				resolve()
				return { ...store, favorite: favoriteNew }
			})
		})
	}
	removePersonaFromFavorite(groupId: string): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'removePersonaFromFavorite')

		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew = favorite.filter((s) => s !== groupId)

				saveToLocalStorage('favorite', favoriteNew)

				resolve()
				return { ...store, favorite: favoriteNew }
			})
		})
	}
	addPersonaDraft(draftPersona: DraftPersona): Promise<number> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'addPersonaDraft')

		return new Promise((resolve) =>
			personas.update(({ draft, ...state }) => {
				const newDraft = [...draft, draftPersona]

				saveToLocalStorage('drafts', newDraft)

				resolve(newDraft.length - 1)

				return { ...state, draft: newDraft }
			}),
		)
	}
	updatePersonaDraft(index: number, draftPersona: DraftPersona): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'updatePersonaDraft')

		return new Promise((resolve) =>
			personas.update(({ draft, ...state }) => {
				draft[index] = draftPersona

				saveToLocalStorage('drafts', draft)

				resolve()

				return { ...state, draft }
			}),
		)
	}

	deleteDraftPersona(index: number): Promise<void> {
		return new Promise((resolve) =>
			personas.update(({ draft, ...state }) => {
				const newDraft = draft.filter((_, i) => i !== index)

				saveToLocalStorage('drafts', newDraft)

				resolve()

				return { ...state, draft: newDraft }
			}),
		)
	}

	async publishPersona(draftPersona: DraftPersona, signer: Signer): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'publishPersona')

		console.info({ draftPersona, signer })

		return new Promise((resolve) => {
			tokens.update(({ go, ...state }) => {
				resolve()
				return { ...state, go: go - CREATE_PERSONA_GO_PRICE }
			})
		})
	}

	async signIn(): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'signIn')

		const signer = await connectWallet()
		const address = await signer.getAddress()

		profile.update((state) => ({ ...state, signer, address }))
	}

	async uploadPicture(picture: string): Promise<string> {
		const blob = await (await fetch(picture)).blob()
		const res = await this.ipfs.add(blob)

		return res.cid.toString()
	}

	getPicture(cid: string): string {
		return `${IPFS_GATEWAY}/${cid}`
	}

	async publishPost(
		groupId: string,
		text: string,
		images: string[],
		signer: Signer,
	): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'publishPost')

		console.log({ signer })

		const post = {
			timestamp: Date.now(),
			text,
			images,
		}

		posts.addPending(post, groupId)
	}

	async subscribePersonaPosts(groupId: string): Promise<() => unknown> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'subscribePersonaPosts')
		console.log({ groupId })

		return () => {
			console.error('NOT IMPLEMENTED', 'subscribePersonaPosts unsubscribe callback')
		}
	}

	async voteOnPost(groupId: string, postId: number, vote: '+' | '-') {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'voteOnPost')

		posts.update((state) => {
			const posts = state.data.get(groupId)
			if (posts) {
				posts.pending[postId].yourVote = vote
				state.data.set(groupId, posts)
			}

			return state
		})
	}

	startChat(chat: Chat): Promise<number> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'startChat')

		return new Promise((resolve) => {
			chats.update((state) => {
				const length = state.chats.push(chat)
				resolve(length)
				return state
			})
		})
	}
	sendChatMessage(chatId: number, text: string): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'sendChatMessage')

		return new Promise((resolve) => {
			chats.update((state) => {
				const newState = { ...state }
				newState.chats[chatId].messages.push({
					timestamp: Date.now(),
					text,
					myMessage: true,
				})
				resolve()
				return newState
			})
		})
	}

	subscribeToChat(chatId: number): () => unknown {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'subscribeToChat')

		const interval = setInterval(() => {
			chats.update((state) => {
				const newState = { ...state }
				newState.chats[chatId].messages.push({
					timestamp: Date.now(),
					text: 'Another second has passed',
				})
				return newState
			})
		}, 1000)

		return () => {
			clearInterval(interval)
		}
	}
}
