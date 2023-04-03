import {connectWallet, getGlobalAnonymousFeed, getProvider} from '$lib/services'
import {type Chat, chats} from '$lib/stores/chat'
import {type DraftPersona, personas} from '$lib/stores/persona'
import {get} from 'svelte/store'
import {profile} from '$lib/stores/profile'
import {saveToLocalStorage} from '$lib/utils'
import type {Adapter} from '..'
import {GroupAdapter} from './group-adapter'
import type {Signer} from 'ethers'
import {create} from 'ipfs-http-client'
import {createIdentity, generateRLNProofForNewPersona, prover, rlnVkey} from './utils'
import {posts} from '$lib/stores/post'
import type {GenericDBAdapterInterface, PostMeta, Zkitter, Message, Chat as ZKitterChat} from 'zkitter-js'
import type {Persona} from '../../stores/persona'
import {UserState} from '@unirep/core'
import type {ZkIdentity as UnirepIdentity} from '@unirep/utils'
import type {ZkIdentity} from '@zk-kit/identity'
import type {GlobalAnonymousFeed} from "../../assets/typechain";
import {getFromLocalStorage} from "../../utils";

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

		this.zkitter = await Zkitter.initialize({ groups: [], topicPrefix: 'kurate_dev_5' })

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
		await this.syncPersonaData(contract)
		await this.syncChats()

		await this.zkitter.services.groups.watch()

		await this.loadFavorite()

		chats.update((state) => {
			return { ...state, loading: false }
		})
	}
	stop() {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'stop')
	}
	private async syncChats() {
		if (!this.identity) return

		const chatMetas = await this.zkitter!.getChatByUser('0x' + this.identity.zkIdentity.genIdentityCommitment().toString(16))

		for (let i = 0; i < chatMetas.length; i++) {
			const meta = chatMetas[i]
			const post = await this.zkitter!.db.getPost(meta.senderSeed)
			const postMeta = await this.zkitter!.getPostMeta(meta.senderSeed)

			if (meta && post && postMeta) {
				const [_, __, personaId] = postMeta.groupId.split('_')
				const persona = get(personas).all.get(personaId)
				if (persona) {
					chats.update((state) => {
						const newState = { ...state }
						newState.chats.set(meta.chatId, {
							persona,
							post: {
								postId: meta.senderSeed,
								timestamp: post.createdAt.getTime(),
								text: post.payload.content,
								images: post.payload.attachment ? [post.payload.attachment] : [],
							},
							users: [],
							chatId: meta.chatId,
							messages: [],
						})
						return newState
					})
				}
			}

		}
	}
	private async syncActivePost(personaId: string) {
		const contract = getGlobalAnonymousFeed()
		const activePosts = await contract.queryFilter(contract.filters.NewPersonaMessage(personaId));

		for (let i = 0; i < activePosts.length; i++) {
			const {args: {messageHash}} = activePosts[i]
			const post = await this.getPostByHash(messageHash)

			if (post) {
				posts.addApproved({
					postId: post.hash(),
					timestamp: post.createdAt.getTime(),
					text: post.payload.content,
					images: post.payload.attachment ? [post.payload.attachment] : [],
				}, personaId)
			}
		}
	}
	private async syncPendingPost(personaId: string) {
		const contract = getGlobalAnonymousFeed()
		const currentEpoch = await contract.attesterCurrentEpoch();
		const proposedPosts = await contract.queryFilter(contract.filters["NewProposedMessage(uint256,uint256,bytes32)"](personaId, currentEpoch));

		for (let i = 0; i < proposedPosts.length; i++) {
			const {args: {messageHash}} = proposedPosts[i]
			const post = await this.getPostByHash(messageHash)

			if (post) {
				posts.addPending(
					{
						postId: post.hash(),
						text: post.payload.content,
						timestamp: post.createdAt.getTime(),
						images: post.payload.attachment ? [post.payload.attachment]: [],
					},
					personaId,
				)
			}
		}
	}
	private async syncPersonasFromContract(contract: GlobalAnonymousFeed) {
		if (this.timeout) clearTimeout(this.timeout)
		await this.queryPersonasFromContract(contract);
		this.timeout = setTimeout(() => this.syncPersonasFromContract(contract), this.contractSyncInterval)
	}
	private async queryPersonasFromContract(contract: GlobalAnonymousFeed) {
		if (!this.zkitter) throw new Error('zkitter is not initialized')

		const numOfPersonas = (await contract.numOfPersonas()).toNumber()
		const personaStore = get(personas)
		const groupIds: string[] = []

		for (let i = 0; i < numOfPersonas; i++) {
			const personaId = '' + i;

			if (!personaStore.all.has(personaId)) {
				const group = new GroupAdapter({
					globalAnonymousFeed: contract,
					db: this.zkitter.db as GenericDBAdapterInterface,
					personaId: i,
				})

				this.zkitter.services.groups.addGroup(group)

				await group.sync()

				groupIds.push(group.groupId)
			}
		}

		personas.update(state => ({ ...state, loading: false }))
	}

	private async syncPersonaData(contract: GlobalAnonymousFeed) {
		const numOfPersonas = (await contract.numOfPersonas()).toNumber()

		for (let i = 0; i < numOfPersonas; i++) {
			const personaId = '' + i;

			const personaData = await contract.personas(i)

			const pitch = await this.getPostByHash(personaData.pitch)
			const description = await this.getPostByHash(personaData.description)

			const persona: Persona = {
				personaId,
				name: personaData.name,
				pitch: pitch?.payload.content || '',
				description: description?.payload.content || '',
				picture: personaData.profileImage,
				cover: personaData.coverImage,
				postsCount: 0,
				participantsCount: 0,
				minReputation: 5,
				// TODO: fix this timestamp
				timestamp: Date.now(),
			}

			personas.update(state => {
				state.all.set(personaId, persona);
				return { ...state };
			})
		}
	}

	async queryPersonaJoined(personaId: string): Promise<boolean> {
		const identityCommitment = this.identity?.unirepIdentity.genIdentityCommitment()

		if (!identityCommitment) return false;

		const contract = getGlobalAnonymousFeed()
		return contract.membersByPersona(personaId, identityCommitment)
	}
	private async loadFavorite(): Promise<void> {
		if (!this.identity) return

		const favorite = getFromLocalStorage<string[]>('favorite', [])

		if (favorite.length) {
			// @ts-ignore
			await this.zkitter!.updateFilter({ group: favorite.map(GroupAdapter.createGroupId) })

			personas.update(store => {
				return {
					...store,
					favorite,
				}
			})
		}
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
	async publishPersona(draftPersona: DraftPersona, signer: Signer): Promise<string> {
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

		const newPersonaId = (await contract.numOfPersonas()).toNumber()

		const pitch = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.pitch },
		})

		await this.zkitter!.services.pubsub.publish(
			pitch,
			await generateRLNProofForNewPersona(pitch.hash(), this.identity.zkIdentity, newPersonaId),
			true
		)

		const description = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.description },
		})

		await this.zkitter!.services.pubsub.publish(
			description,
			await generateRLNProofForNewPersona(description.hash(), this.identity.zkIdentity, newPersonaId),
			true
		)

		const seedPostHashes: string[] = []

		for (let i = 0; i < draftPersona.posts.length; i++) {
			const data = draftPersona.posts[i]
			const post = new Post({
				type: MessageType.Post,
				subtype: PostMessageSubType.Default,
				payload: {
					content: data.text,
					attachment: data.images.length ? data.images[0] : undefined,
				},
			})
			seedPostHashes.push('0x' + post.hash())
			await this.zkitter!.services.pubsub.publish(
				post,
				await generateRLNProofForNewPersona(post.hash(), this.identity.zkIdentity, newPersonaId),
				true
			)
		}

		if (draftPersona.posts.length !== 5) throw new Error('must contain exactly 5 seed posts')
		if (!draftPersona.picture) throw new Error('must contain a profile picture')
		if (!draftPersona.cover) throw new Error('must contain a cover image')

		const signupProof = await state.genUserSignUpProof()

		const resp = await fetch(`http://localhost:3000/create-and-join-without-rep`, {
			method: 'post',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				name: draftPersona.name,
				picture: draftPersona.picture,
				cover: draftPersona.cover,
				pitch: '0x' + pitch.hash(),
				description: '0x' + description.hash(),
				seedPostHashes: seedPostHashes as [string, string, string, string, string],
				signupSignals: signupProof.publicSignals,
				signupProof: signupProof.proof,
			})
		})

		const json = await resp.json()

		console.log(json)

		return String(newPersonaId)

		// return new Promise((resolve) => {
		// 	tokens.update(({ go, ...state }) => {
		// 		resolve()
		// 		return { ...state, go: go - CREATE_PERSONA_GO_PRICE }
		// 	})
		// })
	}

	async joinPersona(personaId: string): Promise<void> {
		if (!this.identity) throw new Error('must sign in first')
		if (!this.zkitter) throw new Error('zkitter is not initialized')

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

		const signupProof = await state.genUserSignUpProof()

		const resp = await fetch(`http://localhost:3000/join-persona`, {
			method: 'post',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				personaId: Number(personaId),
				signupSignals: signupProof.publicSignals,
				signupProof: signupProof.proof,
			})
		})

		const json = await resp.json()

		console.log(json)
	}

	signIn = async (): Promise<void> => {
		const signer = await connectWallet()
		const address = await signer.getAddress()

		const { zkIdentity, unirepIdentity, ecdsa } = await createIdentity(signer)

		this.identity = { zkIdentity, unirepIdentity, ecdsa }

		profile.update((state) => ({
			...state,
			signer,
			address,
			zkIdentity,
			unirepIdentity,
			ecdsa,
		}))

		await this.syncChats()

		await this.loadFavorite()
	}

	async uploadPicture(picture: string): Promise<string> {
		const blob = await (await fetch(picture)).blob()
		const res = await this.ipfs.add(blob)

		return res.cid.toString()
	}

	getPicture(cid: string): string {
		return `${IPFS_GATEWAY}/${cid}`
	}

	async getPostByHash(hash: string) {
		const msgHash = hash.slice(0, 2) === '0x' ? hash.slice(2) : hash
		let post = await this.zkitter!.services.posts.getPost(msgHash)

		if (!post) await this.zkitter!.queryThread(msgHash)

		post = await this.zkitter!.services.posts.getPost(msgHash)

		return post
	}

	async getPostMetaByHash(hash: string): Promise<PostMeta> {
		const msgHash = hash.slice(0, 2) === '0x' ? hash.slice(2) : hash
		let meta = await this.zkitter!.getPostMeta(msgHash)
		if (!meta) await this.zkitter!.queryThread(msgHash)
		meta = await this.zkitter!.getPostMeta(msgHash)
		return meta
	}

	getEpoch(): string[] {
		const timeNow = new Date();
		timeNow.setHours(Math.floor(timeNow.getHours() / 8) * 8);
		timeNow.setMilliseconds(0);
		timeNow.setSeconds(0);
		timeNow.setMinutes(0);
		const baseEpoch = timeNow.getTime();
		return Array(10).fill(0).map((_, i) => String(baseEpoch + i * (28800000/10)))
	}

	async publishPost(
		personaId: string,
		text: string,
		images: string[],
		signer: Signer,
	): Promise<string> {
		const {Post, MessageType, PostMessageSubType} = await import('zkitter-js')
		// const {Registry, RLN} = await import('rlnjs')

		const post = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: {
				content: text,
				attachment: images.length ? images[0] : undefined,
			},
		})

		const proof = await this.zkitter!.createProof({
			hash: post.hash(),
			zkIdentity: this.identity!.zkIdentity,
			groupId: GroupAdapter.createGroupId(personaId),
		})

		// const members = await contract.queryFilter(contract.filters.NewPersonaMember())
		// const rlnRegistry = new Registry(20)
		// for (const { args } of members) {
		// 	const idcommitmentBn = args.identityCommitment.toBigInt()
		// 	if (rlnRegistry.indexOf(idcommitmentBn) < 0) {
		// 		rlnRegistry.addMember(idcommitmentBn)
		// 	}
		// }

		// const epochs = this.getEpoch()
		// const merkleProof = rlnRegistry.generateMerkleProof(this.identity!.unirepIdentity.genIdentityCommitment());
		// const rln = new RLN('http://localhost:3000/rln/rln.wasm', 'http://localhost:3000/rln/rln_final.zkey', rlnVkey)
		// const goTokens: any[] = []
		// for (let i = 0; i < epochs.length; i++) {
		// 	console.log(`generating go token ${i}`)
		// 	const go = await rln.generateProof(post.hash(), merkleProof, epochs[i])
		// 	goTokens.push({
		// 		...go,
		// 		epoch: go.epoch.toString(),
		// 		rlnIdentifier: go.rlnIdentifier.toString(),
		// 		snarkProof: {
		// 			...go.snarkProof,
		// 			publicSignals: {
		// 				...go.snarkProof.publicSignals,
		// 				merkleRoot: merkleProof.root.toString(),
		// 			},
		// 		}
		// 	})
		// }
		// console.log(goTokens)


		await this.zkitter!.services.pubsub.publish(post, proof)

		const resp = await fetch(`http://localhost:3000/propose-message-without-rep`, {
			method: 'post',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				personaId: Number(personaId),
				type: 0,
				postHash: '0x' + post.hash(),
			})
		})

		const json = await resp.json()

		console.log(json)
		// await contract['proposeMessage(uint256,uint8,bytes32)'](
		// 	Number(personaId),
		// 	0,
		// 	'0x' + post.hash(),
		// 	{ gasLimit: 6721974 },
		// )

		const hash = post.hash()

		posts.addPending({
			postId: post.hash(),
			text,
			images,
			timestamp: post.createdAt.getTime(),
		}, personaId)

		return hash
	}

	async subscribePersonaPosts(personaId: string): Promise<() => unknown> {
		const groupId = GroupAdapter.createGroupId(personaId)
		await this.zkitter!.queryGroup(groupId)
		await this.syncActivePost(personaId)
		await this.syncPendingPost(personaId)
		return () => null
	}

	async voteOnPost(
		groupId: string,
		postId: string,
		vote: '+' | '-',
		signer: Signer,
	) {
		const contract = getGlobalAnonymousFeed(signer)

		const state = new UserState(
			{
				prover: prover, // a circuit prover
				attesterId: (await contract.attesterId()).toBigInt(),
				unirepAddress: await contract.unirep(),
				provider: getProvider(), // an ethers.js provider
			},
			this.identity!.unirepIdentity,
		)

		await state.sync.start()
		await state.waitForSync()

		const {proof, publicSignals} = await state.genProveReputationProof({})

		const resp = await fetch(`http://localhost:3000/vote-on-post`, {
			method: 'post',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				postId: '0x' + postId,
				isUpvote: vote === '+',
				publicSignals,
				proof,
			})
		})

		const json = await resp.json()

		console.log(json)

		posts.update((state) => {
			const posts = state.data.get(groupId)

			if (posts) {
				const i = posts.pending.findIndex(post => post.postId === postId);
				posts.pending[i].yourVote = vote
				state.data.set(groupId, posts)
			}

			return state
		})
	}

	async startChat(chat: Chat): Promise<string> {
		const {zkIdentity} = this.identity!
		const msgProof = await this.zkitter!.getProof(chat.post.postId)

		if (msgProof?.type !== 'rln' || !msgProof.ecdh) throw new Error('invalid proof');

		const {generateECDHKeyPairFromZKIdentity, deriveChatId, encrypt} = await import('zkitter-js')
		const {pub} = await generateECDHKeyPairFromZKIdentity(zkIdentity, chat.post.postId)
		const {ecdh: receiverECDH} = msgProof;
		const chatId = await deriveChatId(receiverECDH, pub)

		chats.update((state) => {
			state.chats.set(chatId, {
				...chat,
				chatId,
			})
			return state
		})

		return chatId

	}

	async publishZkitterMessage(message: Message) {
		const {zkIdentity} = this.identity!
		const proof = await this.zkitter!.createProof({
			hash: message.hash(),
			zkIdentity: this.identity!.zkIdentity,
		})

		if (proof.type !== 'rln') throw new Error('invalid proof')

		if (proof.ecdh) {
			await this.zkitter!.db.saveChatECDH(
				'0x' + zkIdentity.genIdentityCommitment().toString(16),
				proof.ecdh
			);
		}

		if (message.type === 'CHAT') {
			await this.zkitter!.db.saveChatECDH(
				'0x' + zkIdentity.genIdentityCommitment().toString(16),
				(message as ZKitterChat).payload.senderECDH,
			);
		}

		const data = await this.zkitter!.publish(message, proof)
		console.log(data)
	}
	async sendChatMessage(chatId: string, text: string): Promise<void> {
		const chatStore = get(chats)
		const chatData = chatStore.chats.get(chatId)
		const {post: {postId}} = chatData!
		const {zkIdentity} = this.identity!
		const msgProof = await this.zkitter!.getProof(postId)

		if (msgProof?.type !== 'rln' || !msgProof.ecdh) return;

		const {Chat, MessageType, ChatMessageSubType, generateECDHKeyPairFromZKIdentity, deriveSharedSecret, encrypt} = await import('zkitter-js')
		const {pub, priv} = await generateECDHKeyPairFromZKIdentity(zkIdentity, postId)
		const {ecdh: receiverECDH} = msgProof;
		const sharedKey = await deriveSharedSecret(receiverECDH, priv)
		const encryptedContent = encrypt(text, sharedKey)

		const chat = new Chat({
			type: MessageType.Chat,
			subtype: ChatMessageSubType.Direct,
			payload: {
				encryptedContent,
				receiverECDH,
				senderECDH: pub,
				senderSeed: postId,
			}
		})

		await this.publishZkitterMessage(chat)

		chats.update((state) => {
			const newState = { ...state }
			newState.chats.get(chatId)!.messages.push({
				timestamp: Date.now(),
				text,
			})
			return newState
		})
	}

	subscribeToChat(chatId: string): () => unknown {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'subscribeToChat')

		new Promise(async (resolve, reject) => {
			const chatStore = get(chats)
			const chatData = chatStore.chats.get(chatId)
			const {post: {postId}} = chatData!

			const {zkIdentity} = this.identity!
			const msgProof = await this.zkitter!.getProof(postId)

			if (msgProof?.type !== 'rln' || !msgProof.ecdh) return;

			const {generateECDHKeyPairFromZKIdentity} = await import('zkitter-js')
			const {pub, priv} = await generateECDHKeyPairFromZKIdentity(zkIdentity, postId)
			const {ecdh: receiverECDH} = msgProof;
			// @ts-ignore
			await this.zkitter!.updateFilter({ ecdh: [pub, receiverECDH] })

			const chatMsgs = await this.zkitter!.getChatMessages(chatId, undefined, undefined, { type: 'zk', zkIdentity, groupId: '' })

			chatMsgs.forEach(msg => {
					chats.update((state) => {
						const newState = { ...state }
						newState.chats.get(chatId)!.messages.push({
							timestamp: msg.createdAt.getTime(),
							text: typeof msg.payload.content === 'undefined' ? 'encryption error' : msg.payload.content,
							address: msg.payload.senderECDH,
						})
						return newState
					})
			})
		})

		return () => null
	}
}
