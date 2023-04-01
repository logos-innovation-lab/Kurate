import { connectWallet } from '$lib/services'
import { chats, type Chat } from '$lib/stores/chat'
import { personas, type DraftPersona, type Persona } from '$lib/stores/persona'
import { profile } from '$lib/stores/profile'
import { saveToLocalStorage } from '$lib/utils'
import type { Signer } from 'ethers'
import { create } from 'ipfs-http-client'
import {
	CREATE_PERSONA_GO_PRICE,
	NEW_POST_GO_PRICE,
	NEW_POST_REP_PRICE,
	VOTE_GO_PRICE,
} from '$lib/constants'
import { tokens } from '$lib/stores/tokens'
import { posts, type Post } from '$lib/stores/post'
import { transaction, type TransactionRecord } from '$lib/stores/transaction'

import type { Adapter } from '..'

// FIXME: no idea where whe should put these so that they don't leak. I can limit to some specific origin I guess
const IPFS_AUTH =
	'Basic Mk5Nbk1vZUNSTWMyOTlCQjYzWm9QZzlQYTU3OjAwZTk2MmJjZTBkZmQxZWQxNGNhNmY1M2JiYjYxMTli'
const IPFS_GATEWAY = 'https://kurate.infura-ipfs.io/ipfs'

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
	getFirestore,
	doc,
	setDoc,
	collection,
	addDoc,
	onSnapshot,
	query,
	updateDoc,
	arrayUnion,
} from 'firebase/firestore'
import { get } from 'svelte/store'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyDH2EKqPTP3MSJKd1jeHfZsiqs2MxxqaUs',
	authDomain: 'kurate-demo.firebaseapp.com',
	projectId: 'kurate-demo',
	storageBucket: 'kurate-demo.appspot.com',
	messagingSenderId: '705467445059',
	appId: '1:705467445059:web:e848928a33d2a27b7b49f6',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

export class Firebase implements Adapter {
	private ipfs = create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: {
			authorization: IPFS_AUTH,
		},
	})
	private subscriptions: Array<() => unknown> = []
	private userSubscriptions: Array<() => unknown> = []

	async start() {
		const personasQuery = query(collection(db, 'personas'))
		const unsubscribePersonas = onSnapshot(personasQuery, (data) => {
			personas.update((state) => {
				const all = new Map<string | number, Persona>()
				data.docs.forEach((e) => {
					const persona = e.data()
					persona.participantsCount = persona.participants?.length
					all.set(e.id, persona as Persona)
				})

				return { ...state, all, loading: false }
			})
		})
		this.subscriptions.push(unsubscribePersonas)

		const unsubscribeUser = profile.subscribe(async (p) => {
			if (p.signer && this.userSubscriptions.length === 0) {
				const userSnapshot = doc(db, `users/${p.address}`)
				const subscribeTokens = onSnapshot(userSnapshot, (res) => {
					type UserRes = { go: number; repStaked: number; repTotal: number }
					const { go, repStaked, repTotal } = res.data() as UserRes
					tokens.update((state) => ({
						...state,
						go: go ?? 5000, // FIXME: this should be DEFAULT_GO_AMOUNT
						repStaked: repStaked ?? 0,
						repTotal: repTotal ?? 5000, // FIXME: this should be 0
					}))
				})
				this.userSubscriptions.push(subscribeTokens)
				const transactionSnapshot = collection(db, `users/${p.address}/transactions`)
				const subscribeTransactions = onSnapshot(transactionSnapshot, (res) => {
					const trns: TransactionRecord[] = []
					res.docs.forEach((d) => {
						trns.push(d.data() as TransactionRecord)
					})
					transaction.set({ transactions: trns })
				})
				this.userSubscriptions.push(subscribeTransactions)
			}
			if (!p.signer && this.userSubscriptions.length !== 0) {
				this.userSubscriptions.forEach((s) => s())
				this.userSubscriptions = []
			}
		})
		this.subscriptions.push(unsubscribeUser)
	}
	stop() {
		this.subscriptions.forEach((s) => s())
		this.userSubscriptions.forEach((s) => s())
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
		const address = await signer.getAddress()
		const personasCollection = collection(db, 'personas')
		const { posts, ...persona } = draftPersona
		const personaDoc = await addDoc(personasCollection, {
			...persona,
			participants: [address],
			postsCount: 5,
		})
		const postCollection = collection(db, `personas/${personaDoc.id}/posts`)
		posts.forEach((p) =>
			addDoc(postCollection, {
				...p,
				address,
			}),
		)

		const profileCollection = collection(db, `users/${address}/transactions`)
		await addDoc(profileCollection, {
			timestamp: Date.now(),
			goChange: -CREATE_PERSONA_GO_PRICE,
			repChange: 0,
			personaId: personaDoc.id,
			type: 'publish persona',
		})

		const { go, repTotal, repStaked } = get(tokens)
		const user = doc(db, `users/${address}`)
		setDoc(
			user,
			{ address, go: go - CREATE_PERSONA_GO_PRICE, repTotal, repStaked },
			{ merge: true },
		)

		personas.update(({ draft, ...state }) => {
			const newDraft = draft.filter((d) => d !== draftPersona)

			saveToLocalStorage('drafts', newDraft)

			return { ...state, draft: newDraft }
		})
	}

	async signIn(): Promise<void> {
		const signer = await connectWallet()
		const address = await signer.getAddress()

		const user = doc(db, `users/${address}`)
		setDoc(user, { address, lastSignIn: Date.now() }, { merge: true })
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
		const post = {
			timestamp: Date.now(),
			text,
			images,
			promote: [],
			demote: [],
		}

		const address = await signer.getAddress()
		const isMemberOfGroup = get(personas).all.get(groupId)?.participants?.includes(address)

		if (!isMemberOfGroup) {
			await signer.signMessage('This "transaction" joins the persona')
			const personaDoc = doc(db, `personas/${groupId}`)
			updateDoc(personaDoc, { participants: arrayUnion(address) })
		}

		await signer.signMessage('This "transaction" publishes a post to pending')

		// Store post to pending
		const pendingPosts = collection(db, `personas/${groupId}/pending`)
		addDoc(pendingPosts, post)

		const profileCollection = collection(db, `users/${address}/transactions`)
		await addDoc(profileCollection, {
			timestamp: Date.now(),
			goChange: -NEW_POST_GO_PRICE,
			repChange: -NEW_POST_REP_PRICE,
			personaId: groupId,
			type: 'publish post',
		})

		const { go, repTotal, repStaked } = get(tokens)
		const user = doc(db, `users/${address}`)
		setDoc(
			user,
			{ address, go: go - NEW_POST_GO_PRICE, repTotal, repStaked: repStaked + NEW_POST_REP_PRICE },
			{ merge: true },
		)
	}

	async subscribePersonaPosts(groupId: string): Promise<() => unknown> {
		const pendingCollection = collection(db, `personas/${groupId}/pending`)
		const postsCollection = collection(db, `personas/${groupId}/posts`)

		const subscribePending = onSnapshot(pendingCollection, (res) => {
			const newPending: Post[] = []

			res.docs.forEach((d) => {
				interface PendingPost {
					demote: string[]
					images: string[]
					promote: string[]
					text: string
					timestamp: number
					address: string
				}
				const { text, images, timestamp, demote, promote, address } = d.data() as PendingPost
				const loggedUser = get(profile)
				let yourVote: '+' | '-' | undefined = undefined
				if (loggedUser.address && promote.includes(loggedUser.address)) yourVote = '+'
				if (loggedUser.address && demote.includes(loggedUser.address)) yourVote = '-'
				newPending.push({
					text,
					images,
					timestamp,
					yourVote,
					postId: d.id,
					myPost: loggedUser.address === address,
				})
			})

			posts.update(({ data }) => {
				const personaPostData = data.get(groupId)
				const pending = newPending
				const approved = personaPostData?.approved ?? []
				data.set(groupId, { loading: false, approved, pending })

				return { data }
			})
		})

		const subscribePosts = onSnapshot(postsCollection, (res) => {
			const newPostst: Post[] = []

			res.docs.forEach((d) => {
				interface DbPost {
					images: string[]
					text: string
					timestamp: number
					address: string
				}
				const { text, images, timestamp, address } = d.data() as DbPost
				const loggedUser = get(profile)
				newPostst.push({
					text,
					images,
					timestamp,
					postId: d.id,
					myPost: address === loggedUser.address,
				})
			})

			posts.update(({ data }) => {
				const personaPostData = data.get(groupId)
				const pending = personaPostData?.pending ?? []
				const approved = newPostst
				data.set(groupId, { loading: false, approved, pending })

				return { data }
			})
		})

		return () => {
			subscribePending()
			subscribePosts()
		}
	}

	async voteOnPost(groupId: string, postId: number, vote: '+' | '-', signer: Signer) {
		await signer.signMessage(`This "transaction" votes ${vote === '+' ? 'promote' : 'demote'}`)
		const address = await signer.getAddress()

		const postData = get(posts).data.get(groupId)?.pending[postId]
		if (!postData) return

		const postDoc = doc(db, `personas/${groupId}/pending/${postData.postId}`)
		updateDoc(postDoc, {
			[vote === '+' ? 'promote' : 'demote']: arrayUnion(address),
		})

		const { go } = get(tokens)
		const user = doc(db, `users/${address}`)
		setDoc(user, { address, go: go - VOTE_GO_PRICE }, { merge: true })

		const profileCollection = collection(db, `users/${address}/transactions`)
		await addDoc(profileCollection, {
			timestamp: Date.now(),
			goChange: -VOTE_GO_PRICE,
			repChange: 0,
			type: vote === '+' ? 'promote' : 'demote',
			personaId: groupId,
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
				// const lastMessage =
				// 	newState.chats[chatId].messages[newState.chats[chatId].messages.length - 1]
				// 10% chance every second to add new message and only when the last message was sent by me
				// if (lastMessage.myMessage && executeWithChance(0.1)) {
				// 	newState.chats[chatId].messages.push({
				// 		timestamp: Date.now(),
				// 		text: randomText(randomIntegerBetween(1, 5)),
				// 	})
				// }
				return newState
			})
		}, 1000)

		return () => {
			clearInterval(interval)
		}
	}
}
