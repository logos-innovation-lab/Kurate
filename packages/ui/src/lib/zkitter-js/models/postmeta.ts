import type { ModerationMessageSubType } from '../utils/message'

export type PostMeta = {
	like: number
	reply: number
	repost: number
	block: number
	global: boolean
	moderation:
		| null
		| ModerationMessageSubType.ThreadMention
		| ModerationMessageSubType.ThreadBlock
		| ModerationMessageSubType.ThreadFollow
	groupId: string
}

export const EmptyPostMeta = (): PostMeta => ({
	like: 0,
	reply: 0,
	repost: 0,
	block: 0,
	global: false,
	moderation: null,
	groupId: '',
})
