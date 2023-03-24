import type { ZkIdentity } from '@zk-kit/identity'
import { connectWallet, getGlobalAnonymousFeed } from '$lib/services'
import { chats, type Chat } from '$lib/stores/chat'
import { personas, type DraftPersona } from '$lib/stores/persona'
import { profile } from '$lib/stores/profile'
import { saveToLocalStorage } from '$lib/utils'
import type { Adapter } from '..'
import { Zkitter } from 'zkitter-js/dist/browser'
import { GroupAdapter } from './group-adapter'
import { ethers, Signer } from 'ethers'
import { create } from 'ipfs-http-client'
import { CREATE_PERSONA_GO_PRICE } from '$lib/constants'
import { tokens } from '$lib/stores/tokens'
import { createIdentity } from './utils'
import { posts } from '$lib/stores/post'

// FIXME: no idea where whe should put these so that they don't leak. I can limit to some specific origin I guess
const IPFS_AUTH =
	'Basic Mk5Nbk1vZUNSTWMyOTlCQjYzWm9QZzlQYTU3OjAwZTk2MmJjZTBkZmQxZWQxNGNhNmY1M2JiYjYxMTli'
const IPFS_GATEWAY = 'https://kurate.infura-ipfs.io/ipfs'

interface Identity {
	identity: ZkIdentity
	ecdh: {
		pub: string
		priv: string
	}
}

export class ZkitterAdapter implements Adapter {
	private zkitter?: Zkitter
	private ipfs = create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: IPFS_AUTH,
		},
	})
	// Stores the different identities for different personas
	// The app does not need to know about these
	// They are stored per group <groupId, identity>
	private identities: Map<string, Identity> = new Map()

	async start() {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'start')

		this.zkitter = await Zkitter.initialize()

		const globalAnonymousFeed = getGlobalAnonymousFeed()
		const groupAdapter = new GroupAdapter({
			globalAnonymousFeed,
			db: this.zkitter.db as any, // FIXME: I don't like using any
		})
		this.zkitter.services.groups.addGroup(groupAdapter as any) // FIXME: I don't like using any
		this.zkitter.on('Zkitter.NewMessageCreated', async (msg, proof) => {
			console.log(msg, proof)
		})
		await groupAdapter.sync()

		await this.zkitter.subscribe()

		this.zkitter.db

		personas.update((state) => {
			const toAdd = Object.keys(groupAdapter.groups)
				.filter((groupId) => !state.all.has(groupId))
				.map((groupId) => ({
					groupId,
					name: '',
					pitch: '',
					description: '',
					postsCount: 0,
					participantsCount: 0,
				}))

			toAdd.forEach((p) => state.all.set(p.groupId, p))

			return {
				...state,
				loading: false,
			}
		})

		chats.update((state) => {
			return { ...state, loading: false }
		})
	}
	stop() {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'stop')
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
				const favoriteNew = favorite.filter((s) => s !== groupId)

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

	async publishPersona(draftPersona: DraftPersona, signer: Signer): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'publishPersona')

		const randBuf = crypto.getRandomValues(new Uint8Array(32))
		const groupId = ethers.utils.sha256(randBuf)

		const { zkIdentity, ecdh } = await createIdentity(signer, groupId)

		await getGlobalAnonymousFeed(signer).createAndJoin(
			groupId,
			`0x${zkIdentity.genIdentityCommitment().toString(16)}`,
		)

		this.identities.set(groupId, { identity: zkIdentity, ecdh })

		return new Promise((resolve) => {
			tokens.update(({ go, ...state }) => {
				resolve()
				return { ...state, go: go - CREATE_PERSONA_GO_PRICE }
			})
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

		let identity = this.identities.get(groupId)

		if (!identity) {
			const { zkIdentity, ecdh } = await createIdentity(signer, groupId)
			identity = { identity: zkIdentity, ecdh }

			this.identities.set(groupId, identity)

			// TODO: check the identity has joined a the group already before posting
		}

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

		if (!this.zkitter) {
			this.zkitter = await Zkitter.initialize()
		}

		const unsubscribe = this.zkitter.subscribe({ groups: [groupId] })

		const identity = this.identities.get(groupId)

		posts.subscribe((p) => {
			const data = p.data.get(groupId)
			if (data === undefined || data.loading === true) {
				// These are just to see something
				posts.addPending(
					{ text: `some text for persona id ${groupId}`, timestamp: Date.now(), images: [] },
					groupId,
				)
				posts.addPending(
					{
						text: `my identity for this persona is ${identity?.identity}`,
						timestamp: Date.now(),
						images: [],
					},
					groupId,
				)
				posts.addPending(
					{
						text: `Something you liked`,
						timestamp: Date.now(),
						images: [],
						yourVote: '+',
					},
					groupId,
				)
				posts.addPending(
					{
						text: `Aaaand something you disliked...`,
						timestamp: Date.now(),
						images: [],
						yourVote: '-',
					},
					groupId,
				)
				posts.addApproved(
					{
						text: `This is some very nice post which actually made it to the persona!`,
						timestamp: Date.now(),
						images: [],
					},
					groupId,
				)
			}
		})

		return unsubscribe
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
