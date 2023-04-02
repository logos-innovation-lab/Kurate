import { writable, type Writable } from 'svelte/store'

export interface Post {
	hash: string
	timestamp: number
	text: string
	images: string[]
	yourVote?: '+' | '-'
	myPost?: boolean
	postId?: string //FIXME: only needed for firebase, might want to remove
	address?: string // FIXME: only needed for firebase, might want to remove
}

interface PostData {
	data: Map<string, { all: Map<string, Post>, approved: string[]; pending: string[]; loading: boolean }>
}

export interface PostStore extends Writable<PostData> {
	setLoading: (groupId: string, loading: boolean) => void
	addPending: (post: Post, groupId: string) => void
	addApproved: (post: Post, groupId: string) => void
}

function createPostStore(): PostStore {
	const store = writable<PostData>({ data: new Map() })

	return {
		...store,
		setLoading: (groupId, loading) => {
			store.update(({ data }) => {
				const personaPostData = data.get(groupId)
				const approved = personaPostData?.approved ?? []
				const pending = personaPostData?.pending ?? []
				const all = personaPostData?.all ?? new Map()
				data.set(groupId, { loading, approved, pending, all })
				return { data }
			})
		},
		addPending: (post: Post, groupId: string) => {
			store.update(({ data }) => {
				const personaPostData = data.get(groupId)
				const all = personaPostData?.all ?? new Map()
				const pending = personaPostData?.pending ?? []
				const approved = personaPostData?.approved ?? []

				if (!all.has(post.hash)) {
					all.set(post.hash, post)
					pending.unshift(post.hash)
				}

				data.set(groupId, { loading: false, approved, pending, all })
				return { data }
			})
		},
		addApproved: (post: Post, groupId: string) => {
			store.update(({ data }) => {
				const personaPostData = data.get(groupId)
				const all = personaPostData?.all ?? new Map()
				const pending = personaPostData?.pending ?? []
				const approved = personaPostData?.approved ?? []

				if (!all.has(post.hash)) {
					all.set(post.hash, post)
					approved.unshift(post.hash)
				}

				console.log({ loading: false, approved, pending, all, groupId })
				data.set(groupId, { loading: false, approved, pending, all })

				return { data }
			})
		},
	}
}

export const posts = createPostStore()
