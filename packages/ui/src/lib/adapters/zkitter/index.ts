import { connectWallet, getGlobalAnonymousFeed, getProvider } from '$lib/services'
import { type Chat, chats } from '$lib/stores/chat'
import { type DraftPersona, personas } from '$lib/stores/persona'
import { get } from 'svelte/store'
import { profile } from '$lib/stores/profile'
import { saveToLocalStorage, sleep } from '$lib/utils'
import type { Adapter } from '..'
import { GroupAdapter } from './group-adapter'
import type { Signer } from 'ethers'
import { create } from 'ipfs-http-client'
import { createIdentity, generateRLNProofForNewPersona, prover } from './utils'
import { posts } from '$lib/stores/post'
import type {
	GenericDBAdapterInterface,
	PostMeta,
	Zkitter,
	Message,
	Post as ZkitterPost,
	Chat as ZKitterChat,
	Proof,
} from 'zkitter-js'
import type { Persona } from '../../stores/persona'
import { UserState, schema } from '@unirep/core'
import type { ZkIdentity as UnirepIdentity } from '@unirep/utils'
import type { ZkIdentity } from '@zk-kit/identity'
import type { GlobalAnonymousFeed } from '../../assets/typechain'
import { getFromLocalStorage } from '../../utils'
import type { ReputationProof, UserStateTransitionProof } from '@unirep/circuits'
import { GLOBAL_ANONYMOUS_FEED_ADDRESS, RELAYER_URL } from '../../constants'

// FIXME: no idea where whe should put these so that they don't leak. I can limit to some specific origin I guess
const IPFS_AUTH =
	'Basic Mk5Nbk1vZUNSTWMyOTlCQjYzWm9QZzlQYTU3OjAwZTk2MmJjZTBkZmQxZWQxNGNhNmY1M2JiYjYxMTli'
const IPFS_GATEWAY = 'https://kurate.infura-ipfs.io/ipfs'

export class ZkitterAdapter implements Adapter {
	protected ipfs = create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: IPFS_AUTH,
		},
	})

	protected identity: {
		zkIdentity: ZkIdentity
		unirepIdentity: UnirepIdentity
		ecdsa: { pub: string; priv: string }
	} | null = null

	protected timeout: ReturnType<typeof setTimeout> | null = null

	protected contractSyncInterval: number = 60 * 1000 // 1 min

	protected userState: UserState | null = null

	protected _startPromise: Promise<Zkitter>

	protected _resolveZkitterStart: (zkitter: Zkitter) => void = () => null

	constructor() {
		this._startPromise = new Promise((resolve) => {
			this._resolveZkitterStart = resolve
		})
	}

	async getZkitterClient(): Promise<Zkitter> {
		return this._startPromise
	}

	async start() {
		const { Zkitter } = await import('zkitter-js')

		const contract = getGlobalAnonymousFeed()

		const zkitter = await Zkitter.initialize({ groups: [], topicPrefix: 'kurate_dev_5' })

		this._resolveZkitterStart(zkitter)

		zkitter.on('Zkitter.NewMessageCreated', async (msg: Message, proof: Proof) => {
			if (msg.type === 'POST') {
				const post = msg as ZkitterPost
				const hash = post.hash()
				const hashOx = '0x' + hash
				const [protocol, contractAddress, personaId] = (
					(proof.type === 'rln' && proof.groupId) ||
					''
				).split('_')

				if (protocol !== 'kurate' && contractAddress !== GLOBAL_ANONYMOUS_FEED_ADDRESS) return

				if (await contract.publishedMessage(hashOx)) {
					console.log('insert post')
					posts.addApproved(
						{
							postId: hash,
							timestamp: post.createdAt.getTime(),
							text: post.payload.content,
							images: post.payload.attachment ? [post.payload.attachment] : [],
						},
						personaId,
					)
					return
				}

				const proposedMessage = await contract.proposedMessageByEpoch(
					await contract.attesterCurrentEpoch(),
					hashOx,
				)

				if (proposedMessage.hash === hashOx) {
					console.log('insert proposed')
					posts.addPending(
						{
							postId: hash,
							text: post.payload.content,
							timestamp: post.createdAt.getTime(),
							images: post.payload.attachment ? [post.payload.attachment] : [],
						},
						personaId,
					)
				}
			}

			if (msg.type === 'CHAT') {
				if (!this.identity) {
					console.error('no identity')
					return
				}
				const { generateECDHKeyPairFromZKIdentity, deriveSharedSecret, decrypt, deriveChatId } =
					await import('zkitter-js')

				const chat = msg as ZKitterChat

				const { zkIdentity } = this.identity
				const postId = chat.payload.senderSeed
				const msgProof = await zkitter.getProof(postId)

				if (msgProof?.type !== 'rln' || !msgProof.ecdh)
					throw new Error('invalid proof from chat id')

				const { pub, priv } = await generateECDHKeyPairFromZKIdentity(zkIdentity, postId)
				const { ecdh: receiverECDH } = msgProof
				const sharedKey = await deriveSharedSecret(receiverECDH, priv)
				const chatId = await deriveChatId(receiverECDH, pub)

				chat.payload.content = decrypt(chat.payload.encryptedContent, sharedKey)
				this.insertChat(chat, chatId)
			}
		})

		zkitter.on('Group.NewGroupMemberCreated', async (member, groupId) => {
			console.log('Group.NewGroupMemberCreated', member, groupId)
		})

		await this.syncPersonasFromContract(contract)
		await this.syncPersonaData(contract)
		await this.syncChats()

		await zkitter.services.groups.watch()

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

		const zkitter = await this.getZkitterClient()

		const chatMetas = await zkitter.getChatByUser(
			'0x' + this.identity.zkIdentity.genIdentityCommitment().toString(16),
		)

		for (let i = 0; i < chatMetas.length; i++) {
			const meta = chatMetas[i]
			const post = await zkitter.db.getPost(meta.senderSeed)
			const postMeta = await zkitter.getPostMeta(meta.senderSeed)

			if (meta && post && postMeta) {
				const [, , personaId] = postMeta.groupId.split('_')
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
		const activePosts = await contract.queryFilter(contract.filters.NewPersonaMessage(personaId))

		for (let i = 0; i < activePosts.length; i++) {
			const {
				args: { messageHash },
			} = activePosts[i]
			const post = await this.getPostByHash(messageHash)

			if (post) {
				posts.addApproved(
					{
						postId: post.hash(),
						timestamp: post.createdAt.getTime(),
						text: post.payload.content,
						images: post.payload.attachment ? [post.payload.attachment] : [],
					},
					personaId,
				)
			}
		}
	}
	private async syncPendingPost(personaId: string) {
		const contract = getGlobalAnonymousFeed()
		const currentEpoch = await contract.attesterCurrentEpoch()
		const proposedPosts = await contract.queryFilter(
			contract.filters['NewProposedMessage(uint256,uint256,bytes32)'](personaId, currentEpoch),
		)

		for (let i = 0; i < proposedPosts.length; i++) {
			const {
				args: { messageHash },
			} = proposedPosts[i]
			const post = await this.getPostByHash(messageHash)

			if (post) {
				posts.addPending(
					{
						postId: post.hash(),
						text: post.payload.content,
						timestamp: post.createdAt.getTime(),
						images: post.payload.attachment ? [post.payload.attachment] : [],
					},
					personaId,
				)
			}
		}
	}
	private async syncPersonasFromContract(contract: GlobalAnonymousFeed) {
		if (this.timeout) clearTimeout(this.timeout)
		await this.queryPersonasFromContract(contract)
		this.timeout = setTimeout(
			() => this.syncPersonasFromContract(contract),
			this.contractSyncInterval,
		)
	}
	private async queryPersonasFromContract(contract: GlobalAnonymousFeed) {
		const zkitter = await this.getZkitterClient()
		const numOfPersonas = (await contract.numOfPersonas()).toNumber()
		const personaStore = get(personas)
		const groupIds: string[] = []

		for (let i = 0; i < numOfPersonas; i++) {
			const personaId = '' + i

			if (!personaStore.all.has(personaId)) {
				const group = new GroupAdapter({
					globalAnonymousFeed: contract,
					db: zkitter.db as GenericDBAdapterInterface,
					personaId: i,
				})

				zkitter.services.groups.addGroup(group)

				await group.sync()

				groupIds.push(group.groupId)
			}
		}

		personas.update((state) => ({ ...state, loading: false }))
	}

	private async syncPersonaData(contract: GlobalAnonymousFeed) {
		const numOfPersonas = (await contract.numOfPersonas()).toNumber()

		for (let i = 0; i < numOfPersonas; i++) {
			const personaId = '' + i

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

			personas.update((state) => {
				state.all.set(personaId, persona)
				return { ...state }
			})
		}
	}

	async queryPersonaJoined(personaId: string): Promise<boolean> {
		const identityCommitment = this.identity?.unirepIdentity.genIdentityCommitment()

		if (!identityCommitment) return false

		const zkitter = await this.getZkitterClient()

		const members = await zkitter.getGroupMembers(GroupAdapter.createGroupId(personaId))

		if (members.includes('0x' + identityCommitment.toString(16))) {
			return true
		}

		const contract = getGlobalAnonymousFeed()
		return contract.membersByPersona(personaId, identityCommitment)
	}

	private async loadFavorite(): Promise<void> {
		if (!this.identity) return

		const favorite = getFromLocalStorage<string[]>('favorite', [])

		const zkitter = await this.getZkitterClient()

		if (favorite.length) {
			await zkitter.updateFilter({ group: favorite.map(GroupAdapter.createGroupId) } as never)

			personas.update((store) => {
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
	async publishPersona(draftPersona: DraftPersona): Promise<string> {
		if (!this.identity) throw new Error('must sign in first')
		if (!this.userState) throw new Error('no userstate')

		const zkitter = await this.getZkitterClient()

		const { MessageType, Post, PostMessageSubType } = await import('zkitter-js')

		const contract = getGlobalAnonymousFeed()

		await this.userState.waitForSync()

		const newPersonaId = (await contract.numOfPersonas()).toNumber()

		const pitch = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.pitch },
		})

		await zkitter.services.pubsub.publish(
			pitch,
			await generateRLNProofForNewPersona(pitch.hash(), this.identity.zkIdentity, newPersonaId),
			true,
		)

		const description = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.description },
		})

		await zkitter.services.pubsub.publish(
			description,
			await generateRLNProofForNewPersona(
				description.hash(),
				this.identity.zkIdentity,
				newPersonaId,
			),
			true,
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
			await zkitter.services.pubsub.publish(
				post,
				await generateRLNProofForNewPersona(post.hash(), this.identity.zkIdentity, newPersonaId),
				true,
			)
		}

		if (draftPersona.posts.length !== 5) throw new Error('must contain exactly 5 seed posts')
		if (!draftPersona.picture) throw new Error('must contain a profile picture')
		if (!draftPersona.cover) throw new Error('must contain a cover image')

		const signupProof = await this.userState.genUserSignUpProof()
		const repProof = await this.genRepProof(contract, 10)
		const resp = await fetch(`${RELAYER_URL}/create-and-join-with-rep`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				name: draftPersona.name,
				picture: draftPersona.picture,
				cover: draftPersona.cover,
				pitch: '0x' + pitch.hash(),
				description: '0x' + description.hash(),
				seedPostHashes: seedPostHashes as [string, string, string, string, string],
				repSignals: repProof.publicSignals,
				repProof: repProof.proof,
				signupSignals: signupProof.publicSignals,
				signupProof: signupProof.proof,
			}),
		})

		// @dev to create without rep
		// const resp = await fetch(`${RELAYER_URL}/create-and-join-without-rep`, {
		// 	method: 'post',
		// 	headers: {
		// 		'content-type': 'application/json'
		// 	},
		// 	body: JSON.stringify({
		// 		name: draftPersona.name,
		// 		picture: draftPersona.picture,
		// 		cover: draftPersona.cover,
		// 		pitch: '0x' + pitch.hash(),
		// 		description: '0x' + description.hash(),
		// 		seedPostHashes: seedPostHashes as [string, string, string, string, string],
		// 		signupSignals: signupProof.publicSignals,
		// 		signupProof: signupProof.proof,
		// 	})
		// })

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
		if (!this.userState) throw new Error('no userstate')
		const zkitter = await this.getZkitterClient()

		await this.userState.waitForSync()

		const signupProof = await this.userState.genUserSignUpProof()

		const resp = await fetch(`${RELAYER_URL}/join-persona`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				personaId: Number(personaId),
				signupSignals: signupProof.publicSignals,
				signupProof: signupProof.proof,
			}),
		})

		const json = await resp.json()

		if (json.error) throw new Error(json.error)

		if (json?.transaction) {
			await this.waitForTx(json.transaction)
			await zkitter.syncGroup(GroupAdapter.createGroupId(personaId))
		}
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

		const contract = getGlobalAnonymousFeed()

		const { IndexedDBConnector } = await import('anondb/web')

		const db = await IndexedDBConnector.create(schema)
		this.userState = new UserState(
			{
				db,
				prover: prover, // a circuit prover
				attesterId: (await contract.attesterId()).toBigInt(),
				unirepAddress: await contract.unirep(),
				provider: getProvider(), // an ethers.js provider
			},
			unirepIdentity,
		)

		await this.userState.sync.start()
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
		const zkitter = await this.getZkitterClient()
		const msgHash = hash.slice(0, 2) === '0x' ? hash.slice(2) : hash
		let post = await zkitter.services.posts.getPost(msgHash)

		if (!post) await zkitter.queryThread(msgHash)

		post = await zkitter.services.posts.getPost(msgHash)

		return post
	}

	async getPostMetaByHash(hash: string): Promise<PostMeta> {
		const zkitter = await this.getZkitterClient()
		const msgHash = hash.slice(0, 2) === '0x' ? hash.slice(2) : hash
		let meta = await zkitter.getPostMeta(msgHash)
		if (!meta) await zkitter.queryThread(msgHash)
		meta = await zkitter.getPostMeta(msgHash)
		return meta
	}

	getEpoch(): string[] {
		const timeNow = new Date()
		timeNow.setHours(Math.floor(timeNow.getHours() / 8) * 8)
		timeNow.setMilliseconds(0)
		timeNow.setSeconds(0)
		timeNow.setMinutes(0)
		const baseEpoch = timeNow.getTime()
		return Array(10)
			.fill(0)
			.map((_, i) => String(baseEpoch + i * (28800000 / 10)))
	}

	async publishPost(personaId: string, text: string, images: string[]): Promise<string> {
		if (!this.identity) throw new Error('must sign in first')
		const { Post, MessageType, PostMessageSubType } = await import('zkitter-js')
		const zkitter = await this.getZkitterClient()

		// const {Registry, RLN} = await import('rlnjs')

		// User did not join the persona yet
		if (!(await this.queryPersonaJoined(personaId))) {
			await this.joinPersona(personaId)

			// Wait for the join to propagate
			await new Promise((resolve) => {
				const interval = setInterval(async () => {
					if (await this.queryPersonaJoined(personaId)) resolve(clearInterval(interval))
				})
			})
		}

		await sleep(1000) // wait for zkitter to sync

		const post = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: {
				content: text,
				attachment: images.length ? images[0] : undefined,
			},
		})

		const proof = await zkitter.createProof({
			hash: post.hash(),
			zkIdentity: this.identity.zkIdentity,
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
		// const rln = new RLN('${RELAYER_URL}/rln/rln.wasm', '${RELAYER_URL}/rln/rln_final.zkey', rlnVkey)
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

		await zkitter.services.pubsub.publish(post, proof)

		const repProof = await this.genRepProof(getGlobalAnonymousFeed(), 5)
		console.log(repProof)
		// const resp = await fetch(`${RELAYER_URL}/propose-message-with-rep`, {
		// 	method: 'post',
		// 	headers: {
		// 		'content-type': 'application/json',
		// 	},
		// 	body: JSON.stringify({
		// 		personaId: Number(personaId),
		// 		type: 0,
		// 		postHash: '0x' + post.hash(),
		// 		repProof: {
		// 			publicSignals: repProof.publicSignals,
		// 			proof: repProof.proof,
		// 		},
		// 	}),
		// })

		// @dev this is to create without rep
		const resp = await fetch(`${RELAYER_URL}/propose-message-without-rep`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				personaId: Number(personaId),
				type: 0,
				postHash: '0x' + post.hash(),
			}),
		})

		const json = await resp.json()

		if (json.error) throw new Error(json.error)

		console.log(json)

		const hash = post.hash()

		posts.addPending(
			{
				postId: post.hash(),
				text,
				images,
				timestamp: post.createdAt.getTime(),
			},
			personaId,
		)

		return hash
	}

	async subscribePersonaPosts(personaId: string): Promise<() => unknown> {
		const groupId = GroupAdapter.createGroupId(personaId)
		const zkitter = await this.getZkitterClient()

		await zkitter.syncGroup(groupId)
		await this.syncActivePost(personaId)
		await this.syncPendingPost(personaId)
		return zkitter.updateFilter({ group: [groupId] } as never)
	}

	private async waitForTx(txHash: string): Promise<number> {
		const provider = getProvider()
		const tx = await provider.getTransaction(txHash)

		if (tx?.blockNumber) return tx.blockNumber

		await new Promise((r) => setTimeout(r, 3000))

		return this.waitForTx(txHash)
	}

	private async userStateTransition(ustProof: UserStateTransitionProof): Promise<string> {
		const resp = await fetch(`${RELAYER_URL}/user-state-transition`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				publicSignals: ustProof.publicSignals,
				proof: ustProof.proof,
			}),
		})

		const json = await resp.json()

		if (json?.error) throw new Error(json.error)
		if (!json?.transaction) throw new Error(json)

		return json.transaction as string
	}

	protected async genRepProof(
		contract: GlobalAnonymousFeed,
		minRep?: number,
	): Promise<ReputationProof> {
		if (!this.userState) throw new Error('user state not initialized')
		await this.userState.waitForSync()

		const latestTransitionedEpoch = await this.userState.latestTransitionedEpoch()
		const currentEpoch = (await contract.attesterCurrentEpoch()).toNumber()

		if (latestTransitionedEpoch < currentEpoch) {
			const ust = await this.userState.genUserStateTransitionProof({})
			const txHash = await this.userStateTransition(ust)
			const blockNumber = await this.waitForTx(txHash)
			await this.userState.waitForSync(blockNumber)
		}

		return this.userState.genProveReputationProof({ minRep })
	}

	async voteOnPost(groupId: string, postId: string, vote: '+' | '-', signer: Signer) {
		const contract = getGlobalAnonymousFeed(signer)

		const { proof, publicSignals } = await this.genRepProof(contract)

		const resp = await fetch(`${RELAYER_URL}/vote-on-post`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				postId: '0x' + postId,
				isUpvote: vote === '+',
				publicSignals,
				proof,
			}),
		})

		const json = await resp.json()

		if (json.error) throw new Error(json.error)

		// posts.update((state) => {
		// 	const posts = state.data.get(groupId)
		//
		// 	if (posts) {
		// 		const i = posts.pending.findIndex(post => post.postId === postId);
		// 		posts.pending[i].yourVote = vote
		// 		state.data.set(groupId, posts)
		// 	}
		//
		// 	return state
		// })
	}

	async startChat(chat: Chat): Promise<string> {
		if (!this.identity) throw new Error('identity not initialized')
		const { zkIdentity } = this.identity
		const zkitter = await this.getZkitterClient()

		const msgProof = await zkitter.getProof(chat.post.postId)

		if (msgProof?.type !== 'rln' || !msgProof.ecdh) throw new Error('invalid proof')

		const { generateECDHKeyPairFromZKIdentity, deriveChatId } = await import('zkitter-js')
		const { pub } = await generateECDHKeyPairFromZKIdentity(zkIdentity, chat.post.postId)
		const { ecdh: receiverECDH } = msgProof
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
		if (!this.identity) throw new Error('identity not initialized')
		const { zkIdentity } = this.identity
		const zkitter = await this.getZkitterClient()

		const proof = await zkitter.createProof({
			hash: message.hash(),
			zkIdentity: this.identity.zkIdentity,
		})

		if (proof.type !== 'rln') throw new Error('invalid proof')

		if (proof.ecdh) {
			await zkitter.db.saveChatECDH(
				'0x' + zkIdentity.genIdentityCommitment().toString(16),
				proof.ecdh,
			)
		}

		if (message.type === 'CHAT') {
			await zkitter.db.saveChatECDH(
				'0x' + zkIdentity.genIdentityCommitment().toString(16),
				(message as ZKitterChat).payload.senderECDH,
			)
		}

		const data = await zkitter.publish(message, proof)
		console.log(data)
	}
	async sendChatMessage(chatId: string, text: string): Promise<void> {
		if (!this.identity) throw new Error('identity not initialized')
		const chatStore = get(chats)
		const chatData = chatStore.chats.get(chatId)
		if (!chatData) throw new Error('chat not found')
		const {
			post: { postId },
		} = chatData
		const { zkIdentity } = this.identity
		const zkitter = await this.getZkitterClient()

		const msgProof = await zkitter.getProof(postId)

		if (msgProof?.type !== 'rln' || !msgProof.ecdh) return

		const {
			Chat,
			MessageType,
			ChatMessageSubType,
			generateECDHKeyPairFromZKIdentity,
			deriveSharedSecret,
			encrypt,
		} = await import('zkitter-js')
		const { pub, priv } = await generateECDHKeyPairFromZKIdentity(zkIdentity, postId)
		const { ecdh: receiverECDH } = msgProof
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
			},
		})

		await this.publishZkitterMessage(chat)

		chats.update((state) => {
			const newState = { ...state }
			newState.chats.get(chatId)?.messages.push({
				timestamp: Date.now(),
				text,
				messageId: chat.hash(),
			})
			return newState
		})
	}

	async subscribeToChat(chatId: string): Promise<() => unknown> {
		if (!this.identity) throw new Error('identity not initialized')
		const chatStore = get(chats)
		const chatData = chatStore.chats.get(chatId)
		if (!chatData) throw new Error('chat not found')
		const {
			post: { postId },
		} = chatData

		const { zkIdentity } = this.identity
		const zkitter = await this.getZkitterClient()

		const msgProof = await zkitter.getProof(postId)

		if (msgProof?.type !== 'rln' || !msgProof.ecdh) throw new Error('invalid proof from chat id')

		const { generateECDHKeyPairFromZKIdentity } = await import('zkitter-js')
		const { pub } = await generateECDHKeyPairFromZKIdentity(zkIdentity, postId)
		const { ecdh: receiverECDH } = msgProof

		const chatMsgs = await zkitter.getChatMessages(chatId, undefined, undefined, {
			type: 'zk',
			zkIdentity,
			groupId: '',
		})

		for (let i = 0; i < chatMsgs.length; i++) {
			this.insertChat(chatMsgs[i], chatId)
		}

		return zkitter.updateFilter({ ecdh: [pub, receiverECDH] } as never)
	}

	private insertChat(chat: ZKitterChat, chatId: string) {
		chats.update((state) => {
			const newState = { ...state }
			const chatStore = newState.chats.get(chatId)
			const chatHash = chat.hash()

			if (!chatStore?.messages.find(({ messageId }) => messageId === chatHash)) {
				chatStore?.messages.push({
					timestamp: chat.createdAt.getTime(),
					text:
						typeof chat.payload.content === 'undefined' ? 'encryption error' : chat.payload.content,
					address: chat.payload.senderECDH,
					messageId: chatHash,
				})
			}

			return newState
		})
	}
}
