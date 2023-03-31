import { connectWallet, getGlobalAnonymousFeed, getProvider } from '$lib/services'
import { type Chat, chats } from '$lib/stores/chat'
import { type DraftPersona, personas } from '$lib/stores/persona'
import { get } from 'svelte/store'
import { profile } from '$lib/stores/profile'
import { saveToLocalStorage } from '$lib/utils'
import type { Adapter } from '..'
import { GroupAdapter } from './group-adapter'
import type { Signer } from 'ethers'
import { create } from 'ipfs-http-client'
import { createIdentity, prover } from './utils'
import { posts } from '$lib/stores/post'
import type { GenericDBAdapterInterface, Zkitter } from 'zkitter-js'
import type { Persona } from '../../stores/persona'
import { UserState } from '@unirep/core'
import { getFromLocalStorage, type SavedSeedMessages } from '../../utils'
import type { ZkIdentity as UnirepIdentity } from '@unirep/utils'
import type { ZkIdentity } from '@zk-kit/identity'
import type {GlobalAnonymousFeed} from "../../assets/typechain";

// FIXME: no idea where whe should put these so that they don't leak. I can limit to some specific origin I guess
const IPFS_AUTH =
	'Basic Mk5Nbk1vZUNSTWMyOTlCQjYzWm9QZzlQYTU3OjAwZTk2MmJjZTBkZmQxZWQxNGNhNmY1M2JiYjYxMTli'
const IPFS_GATEWAY = 'https://kurate.infura-ipfs.io/ipfs'

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

	private identity: {
		zkIdentity: ZkIdentity
		unirepIdentity: UnirepIdentity
		ecdsa: { pub: string; priv: string }
	} | null = null

	private timeout: ReturnType<typeof setTimeout> | null = null

	private contractSyncInterval: number = 60 * 1000 // 1 min

	async start() {
		const { Zkitter } = await import('zkitter-js')

		this.zkitter = await Zkitter.initialize({ groups: [] })

		if (process.env.NODE_ENV !== 'production') {
			this.zkitter.on('Zkitter.NewMessageCreated', async (msg, proof) => {
				console.log('Zkitter.NewMessageCreated', msg, proof)
			})
			this.zkitter.on('Group.NewGroupMemberCreated', async (member, groupId) => {
				console.log('Group.NewGroupMemberCreated', member, groupId)
			})
		}

		const contract = await getGlobalAnonymousFeed()

		await this.syncPersonasFromContract(contract)

		await this.zkitter.services.groups.watch()

		chats.update((state) => {
			return { ...state, loading: false }
		})
	}
	stop() {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'stop')
	}

	private async syncPersonasFromContract(contract: GlobalAnonymousFeed) {
		if (this.timeout) clearTimeout(this.timeout)
		await this.queryPersonasFromContract(contract);
		this.timeout = setTimeout(() => this.syncPersonasFromContract(contract), this.contractSyncInterval)
	}

	private async queryPersonasFromContract(contract: GlobalAnonymousFeed) {
		if (!this.zkitter) throw new Error('zkitter is not initialized')

		// personas.update(state => ({ ...state, loading: true }))

		const numOfPersonas = (await contract.numOfPersonas()).toNumber()
		const personaStore = get(personas)

		for (let i = 0; i < numOfPersonas; i++) {
			const personaId = '' + i;

			if (!personaStore.all.has(personaId)) {
				console.log({
					globalAnonymousFeed: contract,
					db: this.zkitter.db as GenericDBAdapterInterface,
					personaId: i,
				})
				this.zkitter.services.groups.addGroup(
					new GroupAdapter({
						globalAnonymousFeed: contract,
						db: this.zkitter.db as GenericDBAdapterInterface,
						personaId: i,
					}),
				)

				const personaData = await contract.personas(i)

				const persona: Persona = {
					personaId,
					name: personaData.name,
					pitch: personaData.pitch,
					description: personaData.description,
					picture: personaData.profileImage,
					cover: personaData.coverImage,
					postsCount: 0,
					participantsCount: 0,
					minReputation: 5,
				}

				personas.update(state => {
					state.all.set(personaId, persona);
					return { ...state };
				})
			}
		}

		personas.update(state => ({ ...state, loading: false }))
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
	private async savePendingMessagesForIdCommitment(
		personaId: number,
		serializedMessages: string[],
		idCommitment: string,
	): Promise<void> {
		await saveToLocalStorage<SavedSeedMessages>(`kurate/pendingMessages/${idCommitment}`, {
			personaId,
			serializedMessages,
			idCommitment,
		})
	}
	private async getPendingMessagesForIdCommitment(idCommitment: string): Promise<SavedSeedMessages | null> {
		return getFromLocalStorage<SavedSeedMessages | false>(
			`kurate/pendingMessages/${idCommitment}`,
			false
		) || null
	}
	private async maybePublishPendingMessagesForIdCommitment(idCommitment: string) {
		// FIXME: we should probably do something smarter here
		if (!this.zkitter) throw new Error('Zkitter is not initiated yet')

		const pending = await this.getPendingMessagesForIdCommitment(idCommitment)

		if (!pending) return;
		if (!this.identity) return;

		const { personaId, serializedMessages } = pending;
		const { zkIdentity } = this.identity

		if (pending.idCommitment === zkIdentity.genIdentityCommitment().toString()) {
			console.log(`kurate_${personaId}`)
			if (personaId > -1) {
				const { Post } = await import('zkitter-js')
				const posts = serializedMessages.map((hex) => Post.fromHex(hex))

				console.log(posts);
				for (let i = 0; i < posts.length; i++) {
					const post = posts[i]
					const proof = await this.zkitter.createProof({
						hash: post.hash(),
						groupId: `kurate_${personaId}`,
						zkIdentity,
					})

					console.log({ post, proof })
					// await this.zkitter.publish(post, proof)
				}
			}
		}
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
		if (!this.identity) throw new Error('must sign in first')
		if (!this.zkitter) throw new Error('zkitter is not initialized')

		const { MessageType, Post, PostMessageSubType } = await import('zkitter-js')

		const { unirepIdentity } = this.identity

		const contract = getGlobalAnonymousFeed()

		const state = new UserState(
			{
				prover: prover, // a circuit prover
				attesterId: (await contract.attesterId()).toBigInt(),
				unirepAddress: await contract.unirep(),
				provider: getProvider(), // an ethers.js provider
			},
			unirepIdentity,
		)

		await state.sync.start()
		await state.waitForSync()

		const pitch = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.pitch },
		})

		const description = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.description },
		})

		const seedPosts = draftPersona.posts.map(
			(post) =>
				new Post({
					type: MessageType.Post,
					subtype: PostMessageSubType.Default,
					payload: {
						content: post.text,
						attachment: post.images.length ? post.images[0] : undefined,
					},
				}),
		)

		const seedPostHashes: string[] = []
		seedPosts.forEach((seedPost) => seedPostHashes.push('0x' + seedPost.hash()))

		if (seedPostHashes.length !== 5) throw new Error('must contain exactly 5 seed posts')
		if (!draftPersona.picture) throw new Error('must contain a profile picture')
		if (!draftPersona.cover) throw new Error('must contain a cover image')

		const signupProof = await state.genUserSignUpProof()

		const contractWithSigner = await getGlobalAnonymousFeed(signer)
		const newPersonaId = (await contract.numOfPersonas()).toNumber()
		const tx = await contractWithSigner[
			'createAndJoinPersona(string,string,string,bytes32,bytes32,bytes32[5],uint256[],uint256[8])'
		](
			draftPersona.name,
			draftPersona.picture,
			draftPersona.cover,
			'0x' + pitch.hash(),
			'0x' + description.hash(),
			seedPostHashes as [string, string, string, string, string],
			signupProof.publicSignals,
			signupProof.proof,
			{ gasLimit: 6721974 },
		)

		console.log(tx)

		const idCommitment = this.identity.zkIdentity.genIdentityCommitment().toString()

		await this.savePendingMessagesForIdCommitment(
			newPersonaId,
			seedPosts.map((p) => p.toHex()).concat([pitch.toHex(), description.toHex()]),
			idCommitment,
		)

		const cb = async (member: string, groupId: string) => {
			if (member === idCommitment && groupId === `kurate_${newPersonaId}`) {
				await this.maybePublishPendingMessagesForIdCommitment(idCommitment)
				this.zkitter?.off('Group.NewGroupMemberCreated', cb)
			}
		}

		this.zkitter.on('Group.NewGroupMemberCreated', cb)

		// return new Promise((resolve) => {
		// 	tokens.update(({ go, ...state }) => {
		// 		resolve()
		// 		return { ...state, go: go - CREATE_PERSONA_GO_PRICE }
		// 	})
		// })
	}

	signIn = async (): Promise<void> => {
		const signer = await connectWallet()
		const address = await signer.getAddress()

		const { zkIdentity, unirepIdentity, ecdsa } = await createIdentity(signer)

		this.identity = { zkIdentity, unirepIdentity, ecdsa }

		this.maybePublishPendingMessagesForIdCommitment(zkIdentity.genIdentityCommitment().toString())

		profile.update((state) => ({
			...state,
			signer,
			address,
			zkIdentity,
			unirepIdentity,
			ecdsa,
		}))
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
		console.error('NOT IMPLEMENTED', 'publishPost', signer)

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

		// FIXME:
		if (!this.zkitter) throw new Error('Zkitter is not initiated yet')

		const unsubscribe = this.zkitter.subscribe()

		posts.addPending(
			{
				text: `This is some pending persona post`,
				timestamp: Date.now(),
				images: [],
			},
			groupId,
		)

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
