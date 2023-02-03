import { DecoderV0, EncoderV0, MessageV0 } from 'js-waku/lib/waku_message/version_0'
import pDefer from 'p-defer'
import { verifyProof } from '@semaphore-protocol/proof'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'
import type { WithPayload } from './waku'
import type { FullProof } from '@semaphore-protocol/proof'

// Protos
import { Post } from '../protos/post'

// Lib
import { decodeStore, subscribeToWakuTopic } from './waku'
import { fullProofFromProto, type WithFullProof } from './proof'

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

const verifyPostProof = async (post: Post): Promise<boolean> => {
	if (!post.fullProof) {
		return false
	}

	const fullProof = fullProofFromProto(post.fullProof)
	return await verifyProof(fullProof, 20)
}

const decodeWakuPost = async (message: WithPayload<MessageV0>): Promise<PostClean | false> => {
	try {
		const post = Post.decode(message.payload)
		const valid = await verifyPostProof(post)

		if (!valid) {
			return false
		}

		// TODO: Update "as" when asynchronous type narrowing ships in TypeScript
		return {
			text: post.text,
			proof: fullProofFromProto((post as WithFullProof<Post>).fullProof),
		}
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
