import type {ZkIdentity} from '@zk-kit/identity'
import {connectWallet, getGlobalAnonymousFeed, getProvider} from '$lib/services'
import {type Chat, chats} from '$lib/stores/chat'
import {type DraftPersona, personas} from '$lib/stores/persona'
import {profile} from '$lib/stores/profile'
import {saveToLocalStorage} from '$lib/utils'
import type {Adapter} from '..'
// import { Zkitter } from '$lib/zkitter-js'
import {GroupAdapter} from './group-adapter'
import {Signer} from 'ethers'
import {create} from 'ipfs-http-client'
import {createIdentity} from './utils'
import {posts} from '$lib/stores/post'
import type {GenericDBAdapterInterface} from "zkitter-js"
import type {Persona} from "../../stores/persona"
import {UserState, Synchronizer} from '@unirep/core'
import type {Circuit, Prover} from "@unirep/circuits";
import type {SnarkProof, SnarkPublicSignals} from "@unirep/utils";


const prover: Prover = {
	verifyProof: async (
		circuitName: string | Circuit,
		publicSignals: SnarkPublicSignals,
		proof: SnarkProof
	) => {
		const snarkjs = await import('snarkjs');
		const url = new URL(`/${circuitName}.vkey.json`, 'http://localhost:3000')
		const vkey = await fetch(url.toString()).then((r) => r.json())
		return snarkjs.groth16.verify(vkey, publicSignals, proof)
	},
	genProofAndPublicSignals: async (
		circuitName: string | Circuit,
		inputs: any
	) => {
		const snarkjs = await import('snarkjs');
		const wasmUrl = new URL(`/${circuitName}.wasm`, 'http://localhost:3000')
		const wasm = await fetch(wasmUrl.toString()).then((r) =>
			r.arrayBuffer()
		)
		const zkeyUrl = new URL(`/${circuitName}.zkey`, 'http://localhost:3000')
		const zkey = await fetch(zkeyUrl.toString()).then((r) =>
			r.arrayBuffer()
		)
		const { proof, publicSignals } = await snarkjs.groth16.fullProve(
			inputs,
			new Uint8Array(wasm),
			new Uint8Array(zkey)
		)
		return { proof, publicSignals }
	},

	getVKey: async (name: string | Circuit): Promise<any> => {
		return new URL(`/${name}.vkey.json`, 'http://localhost:3000').toString();
	}
}

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
	private zkitter?: any
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

		const { Zkitter } = await import('zkitter-js');
		// console.log(d);

		this.zkitter = await Zkitter.initialize()

		const globalAnonymousFeed = getGlobalAnonymousFeed()
		const groupAdapter = new GroupAdapter({
			globalAnonymousFeed,
			db: this.zkitter.db as GenericDBAdapterInterface
		})

		this.zkitter.services.groups.addGroup(groupAdapter)

		this.zkitter.on('Zkitter.NewMessageCreated', async (msg, proof) => {
			console.log(msg, proof)
		})

		await this.zkitter.services.groups.watch();

		const contract = await getGlobalAnonymousFeed();
		const personaIds = Object.keys(groupAdapter.groups);

		const toAdd: Persona[] = [];

		for (let i = 0; i < personaIds.length; i++) {
			const personaId = personaIds[i];
			const personaData = await contract.personas(personaId.split('_')[1]);
			toAdd.push({
				personaId,
				name: personaData.name,
				pitch: personaData.pitch,
				description: personaData.description,
				picture: personaData.profileImage,
				cover: personaData.coverImage,
				postsCount: 0,
				participantsCount: 0,
			});
		}

		personas.update((state) => {
			const newPersonas = toAdd.filter(({personaId}) => !state.all.has(personaId))
			newPersonas.forEach((p) => state.all.set(p.personaId, p))
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
		const {MessageType, Post, PostMessageSubType} = await import('zkitter-js');

		const { zkIdentity, ecdh } = await createIdentity(signer);

		const contract = await getGlobalAnonymousFeed()

		window.contract = contract;
		console.log(contract);
		const state = new UserState({
			prover: prover, // a circuit prover
			attesterId: (await contract.attesterId()).toBigInt(),
			unirepAddress: await contract.unirep(),
			provider: getProvider(), // an ethers.js provider
		}, zkIdentity)

		await state.sync.start();
		await state.waitForSync();

		const pitch = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.pitch }
		});

		const description = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.description }
		});

		const seedPosts = draftPersona.posts.map(post => new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: post.text }
		}));

		console.log(
			draftPersona.name,
			`https://kurate.infura-ipfs.io/ipfs/${draftPersona.picture}`,
			`https://kurate.infura-ipfs.io/ipfs/${draftPersona.cover}`,
			pitch.toHex(),
			description.toHex(),
			seedPosts.map(p => p.toHex()),
		)

		const seedPostHashes: string[] = [];
		seedPosts.forEach(seedPost => seedPostHashes.push('0x' + seedPost.hash()));

		if (seedPostHashes.length !== 5) throw new Error('must contain exactly 5 seed posts');
		if (!draftPersona.picture) throw new Error('must contain a profile picture');
		if (!draftPersona.cover) throw new Error('must contain a cover image');

		console.log(
			draftPersona.name,
			draftPersona.picture,
			draftPersona.cover,
			'0x' + pitch.hash(),
			'0x' + description.hash(),
			seedPostHashes as [string, string, string, string, string],
			{gasLimit: 6721974}
		)

		const signupProof = await state.genUserSignUpProof();

		const contractWithSigner = await getGlobalAnonymousFeed(signer)
		console.log(signupProof);
		await contractWithSigner['createPersona(string,string,string,bytes32,bytes32,bytes32[5],uint256[],uint256[8])'](
			draftPersona.name,
			draftPersona.picture,
			draftPersona.cover,
			'0x' + pitch.hash(),
			'0x' + description.hash(),
			seedPostHashes as [string, string, string, string, string],
			signupProof.publicSignals,
			signupProof.proof,
			{gasLimit: 6721974}
		)
		//
		// this.identities.set(groupId, { identity: zkIdentity, ecdh })

		// return new Promise((resolve) => {
		// 	tokens.update(({ go, ...state }) => {
		// 		resolve()
		// 		return { ...state, go: go - CREATE_PERSONA_GO_PRICE }
		// 	})
		// })
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
