import { DecoderV0, EncoderV0, MessageV0 } from 'js-waku/lib/waku_message/version_0'
import pDefer from 'p-defer'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'
import type { WithPayload } from './waku'
import type { FullProof } from '@semaphore-protocol/proof'

// Protos
import { Post } from '../protos/post'

// Lib
import { decodeStore, subscribeToWakuTopic } from './waku'

export type CreatePost = {
	text: string
}

export type PostClean = {
	text: string
	proof: FullProof
}

export const getPostsTopic = () => {
	return `/the-outlet/1/posts/proto`
}

export const createPost = async (waku: WakuLight, { text }: CreatePost) => {
	// Create the payload
	const payload = Post.encode({ text })

	// Post the metadata on Waku
	await waku.lightPush.push(new EncoderV0(getPostsTopic()), { payload })
}

const verifyPostProof = (post: Post) => {
	/*
	const from = getAddress('0x' + utils.bytesToHex(reply.from))
	const recovered = verifyTypedData(
		DOMAIN,
		TYPES,
		{
			from,
			marketplace: reply.marketplace,
			item: reply.item,
			text: reply.text,
			keyExchange: reply.keyExchange,
		},
		reply.signature,
	)
	return recovered === from
  */
	return true
}

const decodeWakuPost = async (message: WithPayload<MessageV0>): Promise<PostClean | false> => {
	try {
		const post = Post.decode(message.payload)
		return (
			verifyPostProof(post) && {
				text: post.text,
				proof: {},
			}
		)
	} catch (err) {
		return false
	}
}

export const subscribeToPosts = async (
	waku: WakuLight,
	callback: (response: PostClean) => void,
	onError?: (error: string) => void,
	onDone?: () => void,
	watch = true,
) => {
	const topic = getPostsTopic()
	const decoders = [new DecoderV0(topic)]
	return subscribeToWakuTopic(
		waku,
		decoders,
		decodeStore(decodeWakuPost, callback),
		onError,
		onDone,
		watch,
	)
}

export const getPosts = async (waku: WakuLight): Promise<PostClean[]> => {
	const items: PostClean[] = []
	const defer = pDefer<PostClean[]>()
	const collect = (item: PostClean) => void items.push(item)

	await subscribeToPosts(waku, collect, defer.reject, () => defer.resolve(items), false)

	return defer.promise
}
