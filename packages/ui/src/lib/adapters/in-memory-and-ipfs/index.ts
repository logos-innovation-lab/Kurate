import { connectWallet } from '$lib/services'
import { chats, type Chat } from '$lib/stores/chat'
import { personas, type DraftPersona, type Persona } from '$lib/stores/persona'
import { profile } from '$lib/stores/profile'
import { getFromLocalStorage, saveToLocalStorage, sleep } from '$lib/utils'
import type { Signer } from 'ethers'
import { create } from 'ipfs-http-client'
import {
	CREATE_PERSONA_GO_PRICE,
	NEW_POST_GO_PRICE,
	NEW_POST_REP_PRICE,
	VOTE_GO_PRICE,
} from '$lib/constants'
import { tokens, type TokenData } from '$lib/stores/tokens'
import { posts, type Post } from '$lib/stores/post'
import { transaction } from '$lib/stores/transaction'

import type { Adapter } from '..'
import {
	executeWithChance,
	randomId,
	randomIntegerBetween,
	randomPersona,
	randomPost,
	randomText,
} from './utils'

// FIXME: no idea where whe should put these so that they don't leak. I can limit to some specific origin I guess
const IPFS_AUTH =
	'Basic Mk5Nbk1vZUNSTWMyOTlCQjYzWm9QZzlQYTU3OjAwZTk2MmJjZTBkZmQxZWQxNGNhNmY1M2JiYjYxMTli'
const IPFS_GATEWAY = 'https://kurate.infura-ipfs.io/ipfs'

function addRandomPost(groupId: string, pending: boolean) {
	const post = randomPost()
	if (pending) posts.addPending(post, groupId)
	else posts.addApproved(post, groupId)
}

function addRandomPersona() {
	// FIXME: it can happen that this ID already exists
	const groupId = randomId()
	personas.update((state) => {
		const persona = randomPersona(groupId)
		state.all.set(groupId, persona)

		// The persona should have 5-15 approved posts
		for (let i = 0; i < randomIntegerBetween(5, 15); i++) {
			addRandomPost(groupId, false)
		}

		// The persona should have 0-20 pending posts
		for (let i = 0; i < randomIntegerBetween(0, 20); i++) {
			addRandomPost(groupId, true)
		}

		return { ...state }
	})
}

function addRandomThings() {
	// 1% chance to add new persona every second
	if (executeWithChance(0.01)) addRandomPersona()
}

function startAddition(): () => unknown {
	const interval = setInterval(addRandomThings, 1000)

	return () => {
		clearInterval(interval)
	}
}

export class InMemoryAndIPFS implements Adapter {
	private ipfs = create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: IPFS_AUTH,
		},
	})
	private subscriptions: Array<() => unknown> = []

	async start() {
		const storedPersonas = new Map<string, Persona>(getFromLocalStorage('personas', []))
		const draftPersonas = getFromLocalStorage('drafts', [])
		const storedChats = getFromLocalStorage('chats', [])
		const storedPosts = new Map<string, { approved: Post[]; pending: Post[]; loading: boolean }>(
			getFromLocalStorage('posts', []),
		)
		const storedTokens = getFromLocalStorage('tokens', {
			go: 30,
			repTotal: 55,
			repStaked: 5,
			loading: false,
			goHistoricalValues: [],
			repStakedHistoricalValues: [],
			repTotalHistoricalValues: [],
			epochDuration: 5 * 60 * 1000,
		})

		tokens.set(storedTokens)

		this.subscriptions.push(
			tokens.subscribe((state) => {
				let newState: TokenData | undefined = undefined
				if (
					state.goHistoricalValues.length === 0 ||
					state.go !== state.goHistoricalValues[state.goHistoricalValues.length - 1].value
				) {
					newState = {...state}
					newState.goHistoricalValues.push({ timestamp: Date.now(), value: state.go })
				}
				if (
					state.repStakedHistoricalValues.length === 0 ||
					state.repStaked !==
						state.repStakedHistoricalValues[state.repStakedHistoricalValues.length - 1].value
				) {
					if (newState === undefined) {
						newState = {...state}
					}
					newState.repStakedHistoricalValues.push({ timestamp: Date.now(), value: state.repStaked })
				}
				if (
					state.repTotalHistoricalValues.length === 0 ||
					state.repTotal !==
						state.repTotalHistoricalValues[state.repTotalHistoricalValues.length - 1].value
				) {
					
					if (newState === undefined) {
						newState = {...state}
					}
					newState.repTotalHistoricalValues.push({ timestamp: Date.now(), value: state.repTotal })
				}
				if (newState !== undefined) {
					tokens.update(() => state)
					saveToLocalStorage('tokens', state)
				}
			}),
		)

		// It takes 1 second to load all the data :)
		await sleep(1000)

		// There is no persona so we create one in 1 second :)
		if (storedPersonas.size === 0) setTimeout(addRandomPersona, 1000)

		personas.update((state) => {
			return {
				...state,
				all: storedPersonas,
				draft: draftPersonas,
				loading: false,
			}
		})

		chats.update((state) => {
			return {
				...state,
				chats: storedChats,
				loading: false,
			}
		})

		posts.set({ data: storedPosts })

		this.subscriptions.push(
			personas.subscribe(({ all }) => {
				saveToLocalStorage('personas', Array.from(all.entries()))
			}),
		)
		this.subscriptions.push(
			chats.subscribe(({ chats }) => {
				saveToLocalStorage('chats', chats)
			}),
		)
		this.subscriptions.push(
			posts.subscribe(({ data }) => {
				saveToLocalStorage('posts', Array.from(data.entries()))
			}),
		)
		this.subscriptions.push(startAddition())

		chats.update((state) => {
			return { ...state, loading: false }
		})
	}
	stop() {
		this.subscriptions.forEach((s) => s())
	}
	addPersonaToFavorite(groupId: string): Promise<void> {
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
		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew: string[] = favorite.filter((s) => s !== groupId)

				saveToLocalStorage('favorite', favoriteNew)

				resolve()
				return { ...store, favorite: favoriteNew }
			})
		})
	}
	addPersonaDraft(draftPersona: DraftPersona): Promise<number> {
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
		await signer.signMessage('This "transaction" publishes persona')

		function getRandomNonExistingId(): Promise<string> {
			let groupId = randomId()
			return new Promise((resolve) => {
				personas.subscribe((s) => {
					while (s.all.has(groupId)) {
						groupId = randomId()
					}
					resolve(groupId)
				})
			})
		}

		const groupId = await getRandomNonExistingId()

		personas.update((state) => {
			state.all.set(groupId, {
				...draftPersona,
				postsCount: 5,
				participantsCount: 1,
				personaId: groupId,
			})

			return { ...state }
		})

		draftPersona.posts.forEach((p) => posts.addApproved(p, groupId))

		personas.update(({ draft, ...state }) => {
			const newDraft = draft.filter((d) => d !== draftPersona)

			saveToLocalStorage('drafts', newDraft)

			return { ...state, draft: newDraft }
		})

		tokens.update(({ go, ...state }) => {
			return { ...state, go: go - CREATE_PERSONA_GO_PRICE }
		})

		transaction.update(({ transactions }) => {
			transactions.push({
				timestamp: Date.now(),
				goChange: -CREATE_PERSONA_GO_PRICE,
				repChange: 0,
				personaId: groupId,
				type: 'publish persona',
			})
			return { transactions }
		})
	}

	async signIn(): Promise<void> {
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
		if (cid.startsWith('/')) return `https://picsum.photos/seed${cid}`
		return `${IPFS_GATEWAY}/${cid}`
	}

	async publishPost(
		groupId: string,
		text: string,
		images: string[],
		signer: Signer,
	): Promise<void> {
		await signer.signMessage('This "transaction" publishes a post to pending')

		const post = {
			timestamp: Date.now(),
			text,
			images,
		}

		tokens.update(({ go, repStaked, ...state }) => {
			return { ...state, repStaked: repStaked + NEW_POST_REP_PRICE, go: go - NEW_POST_GO_PRICE }
		})

		posts.addPending(post, groupId)

		transaction.update(({ transactions }) => {
			transactions.push({
				timestamp: Date.now(),
				goChange: -NEW_POST_GO_PRICE,
				repChange: -NEW_POST_REP_PRICE,
				personaId: groupId,
				type: 'publish post',
			})
			return { transactions }
		})
	}

	async subscribePersonaPosts(groupId: string): Promise<() => unknown> {
		const interval = setInterval(() => {
			// 5% chance every second to add new pending post
			if (executeWithChance(0.05)) addRandomPost(groupId, true)
		}, 1000)

		return () => clearInterval(interval)
	}

	async voteOnPost(groupId: string, postId: number, vote: '+' | '-', signer: Signer) {
		await signer.signMessage(`This "transaction" votes ${vote === '+' ? 'promote' : 'demote'}`)

		posts.update((state) => {
			const posts = state.data.get(groupId)
			if (posts) {
				posts.pending[postId].yourVote = vote
				state.data.set(groupId, posts)
			}

			return state
		})

		tokens.update(({ go, ...state }) => {
			return {
				...state,
				go: go - VOTE_GO_PRICE,
			}
		})
		transaction.update(({ transactions }) => {
			transactions.push({
				timestamp: Date.now(),
				goChange: -CREATE_PERSONA_GO_PRICE,
				repChange: 0,
				type: vote === '+' ? 'promote' : 'demote',
				personaId: groupId,
			})
			return { transactions }
		})
	}

	startChat(chat: Chat): Promise<number> {
		return new Promise((resolve) => {
			chats.update((state) => {
				const length = state.chats.push(chat)
				resolve(length)
				return state
			})
		})
	}

	sendChatMessage(chatId: number, text: string): Promise<void> {
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
		const interval = setInterval(() => {
			chats.update((state) => {
				const newState = { ...state }
				const lastMessage =
					newState.chats[chatId].messages[newState.chats[chatId].messages.length - 1]
				// 10% chance every second to add new message and only when the last message was sent by me
				if (lastMessage.myMessage && executeWithChance(0.1)) {
					newState.chats[chatId].messages.push({
						timestamp: Date.now(),
						text: randomText(randomIntegerBetween(1, 5)),
					})
				}
				return newState
			})
		}, 1000)

		return () => {
			clearInterval(interval)
		}
	}
}
