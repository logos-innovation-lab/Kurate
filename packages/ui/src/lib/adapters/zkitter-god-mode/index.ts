import { getGlobalAnonymousFeed, getProvider } from '$lib/services'
import { sleep } from '$lib/utils'
import { GroupAdapter } from '../zkitter/group-adapter'
import type { Signer } from 'ethers'
import { posts } from '$lib/stores/post'
import { RELAYER_URL } from '../../constants'
import { ZkitterAdapter } from '../zkitter'
import { tokens } from '$lib/stores/tokens'
import { generateRLNProofForNewPersona, prover } from '../zkitter/utils'
import type { DraftPersona } from '$lib/stores/persona'

const epochDuration = 8 * 60 * 60 * 1000

export class ZkitterAdapterGodMode extends ZkitterAdapter {
	constructor() {
		super()
	}

	start(): Promise<void> {
		tokens.set({
			repStaked: 0,
			repTotal: Infinity,
			go: Infinity,
			loading: false,
			epochDuration,
			timeToEpoch: 0,
		})
		return super.start()
	}

	async publishPost(
		personaId: string,
		text: string,
		images: string[],
		signer: Signer,
	): Promise<string> {
		const { Post, MessageType, PostMessageSubType } = await import('zkitter-js')

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

		if (!this.zkitter) throw Error('zkitter is not initialized')
		if (!this.identity) throw Error('must sign in first')

		const proof = await this.zkitter.createProof({
			hash: post.hash(),
			zkIdentity: this.identity.zkIdentity,
			groupId: GroupAdapter.createGroupId(personaId),
		})

		await this.zkitter.services.pubsub.publish(post, proof)

		// const repProof = await this.genRepProof(getGlobalAnonymousFeed(), 5)
		// console.log(repProof)

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

	async publishPersona(draftPersona: DraftPersona, signer: Signer): Promise<string> {
		if (!this.identity) throw new Error('must sign in first')
		if (!this.zkitter) throw new Error('zkitter is not initialized')

		const { MessageType, Post, PostMessageSubType } = await import('zkitter-js')

		const contract = getGlobalAnonymousFeed()

		await this.userState!.waitForSync()

		const newPersonaId = (await contract.numOfPersonas()).toNumber()

		const pitch = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.pitch },
		})

		if (!this.zkitter) throw Error('zkitter is not initialized')

		await this.zkitter.services.pubsub.publish(
			pitch,
			await generateRLNProofForNewPersona(pitch.hash(), this.identity.zkIdentity, newPersonaId),
			true,
		)

		const description = new Post({
			type: MessageType.Post,
			subtype: PostMessageSubType.Default,
			payload: { content: draftPersona.description },
		})

		await this.zkitter.services.pubsub.publish(
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
			await this.zkitter.services.pubsub.publish(
				post,
				await generateRLNProofForNewPersona(post.hash(), this.identity.zkIdentity, newPersonaId),
				true,
			)
		}

		if (draftPersona.posts.length !== 5) throw new Error('must contain exactly 5 seed posts')
		if (!draftPersona.picture) throw new Error('must contain a profile picture')
		if (!draftPersona.cover) throw new Error('must contain a cover image')

		const signupProof = await this.userState!.genUserSignUpProof()

		const resp = await fetch(`${RELAYER_URL}/create-and-join-without-rep`, {
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
				signupSignals: signupProof.publicSignals,
				signupProof: signupProof.proof,
			}),
		})

		const json = await resp.json()

		console.log(json)

		return String(newPersonaId)
	}
}
