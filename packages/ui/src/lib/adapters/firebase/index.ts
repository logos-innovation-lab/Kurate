import { connectWallet } from '$lib/services'
import { chats, type Chat, type Message } from '$lib/stores/chat'
import { personas, type DraftPersona, type Persona } from '$lib/stores/persona'
import { profile } from '$lib/stores/profile'
import { getFromLocalStorage, saveToLocalStorage } from '$lib/utils'
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
	where,
} from 'firebase/firestore'
import { get } from 'svelte/store'
import { subscribeAccountChanged, subscribeChainChanged } from '../utils'
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

function epochCounter(): () => unknown {
	const interval = setInterval(() => {
		tokens.update(({ epochDuration, ...rest }) => {
			const newTimeToEpoch = epochDuration - (Date.now() % epochDuration)

			return { ...rest, epochDuration, timeToEpoch: newTimeToEpoch }
		})
	}, 1000)

	return () => {
		clearInterval(interval)
	}
}

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
	private votes = new Map<string, { promote: string[]; demote: string[] }>()

	async start() {
		const personasQuery = query(collection(db, 'personas'))
		const unsubscribePersonas = onSnapshot(personasQuery, (data) => {
			personas.update((state) => {
				const all = new Map<string, Persona>()
				data.docs.forEach((e) => {
					const persona = e.data()
					persona.participantsCount = persona.participants?.length
					persona.personaId = e.id
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

				const chatsSnapshot = query(
					collection(db, `chats`),
					where('users', 'array-contains', p.address),
				)
				const subscribeChats = onSnapshot(chatsSnapshot, (res) => {
					const newChats = new Map<string, Chat>()
					const personasTemp = get(personas)
					res.docs.forEach((d) => {
						const data = d.data()
						const persona = personasTemp.all.get(data.personaId)
						if (!persona) return
						const chat: Chat = {
							persona,
							post: data.post,
							users: data.users,
							chatId: d.id,
							messages: data.messages,
						}
						newChats.set(d.id, chat)
					})
					chats.update((state) => ({ ...state, chats: newChats, loading: false }))
				})
				this.userSubscriptions.push(subscribeChats)
			}
			if (!p.signer && this.userSubscriptions.length !== 0) {
				this.userSubscriptions.forEach((s) => s())
				this.userSubscriptions = []
			}
		})
		this.subscriptions.push(unsubscribeUser)
		this.subscriptions.push(epochCounter())
		this.subscriptions.push(subscribeAccountChanged())
		this.subscriptions.push(subscribeChainChanged())
	}
	stop() {
		this.subscriptions.forEach((s) => s())
		this.userSubscriptions.forEach((s) => s())
	}
	addPersonaToFavorite(groupId: string): Promise<void> {
		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew: string[] = [...favorite, groupId]
				const { address } = get(profile)

				if (address) saveToLocalStorage(`${address}-firebase-favorite`, favoriteNew)

				resolve()
				return { ...store, favorite: favoriteNew }
			})
		})
	}
	removePersonaFromFavorite(groupId: string): Promise<void> {
		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew: string[] = favorite.filter((s) => s !== groupId)
				const { address } = get(profile)

				if (address) saveToLocalStorage(`${address}-firebase-favorite`, favoriteNew)

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
		await signer.signMessage('This "transaction" publishes persona')
		const address = await signer.getAddress()
		const personasCollection = collection(db, 'personas')
		const { posts, ...persona } = draftPersona
		const personaDoc = await addDoc(personasCollection, {
			...persona,
			participants: [address],
			postsCount: 5,
			timestamp: Date.now(),
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

			saveToLocalStorage(`${address}-firebase-drafts`, newDraft)

			return { ...state, draft: newDraft }
		})

		return personaDoc.id
	}

	async signIn(): Promise<void> {
		const signer = await connectWallet()
		const address = await signer.getAddress()
		const draftPersonas = getFromLocalStorage(`${address}-firebase-drafts`, [])
		const favoritePersonas = getFromLocalStorage(`${address}-firebase-favorite`, [])
		personas.update((state) => ({ ...state, drafts: draftPersonas, favorite: favoritePersonas }))

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
	): Promise<string> {
		const address = await signer.getAddress()
		const isMemberOfGroup = get(personas).all.get(groupId)?.participants?.includes(address)

		const post = {
			timestamp: Date.now(),
			text,
			images,
			promote: [],
			demote: [],
			address,
		}

		if (!isMemberOfGroup) {
			await signer.signMessage('This "transaction" joins the persona')
			const personaDoc = doc(db, `personas/${groupId}`)
			updateDoc(personaDoc, { participants: arrayUnion(address) })
		}

		await signer.signMessage('This "transaction" publishes a post to pending')

		// Store post to pending
		const pendingPosts = collection(db, `personas/${groupId}/pending`)
		const postDoc = await addDoc(pendingPosts, post)

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

		return postDoc.id
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
				this.votes.set(d.id, { promote, demote })
				if (loggedUser.address && promote.includes(loggedUser.address)) yourVote = '+'
				if (loggedUser.address && demote.includes(loggedUser.address)) yourVote = '-'
				newPending.push({
					text,
					images,
					timestamp,
					yourVote,
					postId: d.id,
					address,
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

		// Ensures that votuse and whether the post is yours is updated after user logs in
		const subscribeProfileChangePending = profile.subscribe(({ address }) => {
			if (address) {
				posts.update(({ data }) => {
					const personaPostData = data.get(groupId)
					if (!personaPostData) return { data }

					const pending = personaPostData.pending.map((p) => {
						if (p.postId === undefined) return p
						const vt = this.votes.get(p.postId)
						if (vt === undefined) return p
						let yourVote: '+' | '-' | undefined = undefined
						if (vt.promote.includes(address)) yourVote = '+'
						if (vt.demote.includes(address)) yourVote = '-'

						return { ...p, myPost: p.address === address, yourVote }
					})
					data.set(groupId, { ...personaPostData, pending })

					return { data }
				})
			}
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
					address,
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
			subscribeProfileChangePending()
			subscribePending()
			subscribePosts()
		}
	}

	async voteOnPost(groupId: string, postId: string, vote: '+' | '-', signer: Signer) {
		const promoteDemote: 'promote' | 'demote' = vote === '+' ? 'promote' : 'demote'
		await signer.signMessage(
			`By confirming this "transaction" you are casting ${promoteDemote} vote on the post`,
		)
		const address = await signer.getAddress()

		const postData = get(posts)
			.data.get(groupId)
			?.pending.find((p) => p.postId === postId)
		if (!postData) return

		const postDoc = doc(db, `personas/${groupId}/pending/${postData.postId}`)
		updateDoc(postDoc, {
			[promoteDemote]: arrayUnion(address),
		})

		const { go } = get(tokens)
		const user = doc(db, `users/${address}`)
		setDoc(user, { address, go: go - VOTE_GO_PRICE }, { merge: true })

		const profileCollection = collection(db, `users/${address}/transactions`)
		await addDoc(profileCollection, {
			timestamp: Date.now(),
			goChange: -VOTE_GO_PRICE,
			repChange: 0,
			type: promoteDemote,
			personaId: groupId,
		})
	}

	async startChat(chat: Chat): Promise<string> {
		const address = get(profile).address

		if (!address) throw new Error('You need to be logged in to start a chat')
		if (!chat.post.address) throw new Error('Info about original poster is missing')
		if (!chat.post.postId) throw new Error('PostId is missing')
		if (!chat.persona.personaId) throw new Error('PersonaId is missing')
		if (chat.messages.length === 0) throw new Error('No messages to start a chat')

		const dbChat = {
			users: [address, chat.post.address],
			post: chat.post,
			personaId: chat.persona.personaId,
			messages: chat.messages,
		}
		const chatCollection = collection(db, `/chats`)
		const chatDoc = await addDoc(chatCollection, dbChat)

		return chatDoc.id
	}

	async sendChatMessage(chatId: string, text: string): Promise<void> {
		const address = get(profile).address

		if (!address) throw new Error('ChatId or address is missing')

		const message: Message = {
			timestamp: Date.now(),
			text,
			address,
		}

		const chatDoc = doc(db, `chats/${chatId}`)
		updateDoc(chatDoc, { messages: arrayUnion(message), lastMessage: text })
	}

	async queryPersonaJoined(personId: string): Promise<boolean> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'queryPersonaJoined')
		return false;
	}

	async joinPersona(personId: string): Promise<void> {
		// FIXME: properly implement
		console.error('NOT IMPLEMENTED', 'joinPersona')
	}
}
