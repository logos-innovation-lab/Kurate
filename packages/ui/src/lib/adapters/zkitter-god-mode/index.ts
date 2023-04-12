import { getGlobalAnonymousFeed } from '$lib/services'
import { sleep } from '$lib/utils'
import { GroupAdapter } from '../zkitter/group-adapter'
import type { Signer } from 'ethers'
import { posts } from '$lib/stores/post'
import { RELAYER_URL } from '../../constants'
import { ZkitterAdapter } from '../zkitter'
import { tokens } from '$lib/stores/tokens'

const epochDuration = 8 * 60 * 60 * 1000

export class ZkitterAdapterGodMode extends ZkitterAdapter {
	constructor() {
		super()
	}

	start(): Promise<void> {
		tokens.set({
			repStaked: 0,
			repTotal: 9999,
			go: 9999,
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
		// const {Registry, RLN} = await import('rlnjs')

		// User did not join the persona yet
		if (await this.queryPersonaJoined(personaId)) {
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

		const proof = await this.zkitter!.createProof({
			hash: post.hash(),
			zkIdentity: this.identity!.zkIdentity,
			groupId: GroupAdapter.createGroupId(personaId),
		})

		await this.zkitter!.services.pubsub.publish(post, proof)

		const repProof = await this.genRepProof(getGlobalAnonymousFeed(), 5)
		console.log(repProof)

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
}
