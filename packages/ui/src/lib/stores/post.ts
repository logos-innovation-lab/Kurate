import { writable, type Writable } from 'svelte/store'

export interface DraftPost {
	timestamp: number
	text: string
	images: string[]
}

export interface Post extends DraftPost {
	yourVote?: '+' | '-'
	myPost?: boolean
	postId: string
	address?: string // FIXME: only needed for firebase, might want to remove
}

interface PostData {
	data: Map<string, { approved: Post[]; pending: Post[]; loading: boolean }>
}

export interface PostStore extends Writable<PostData> {
	addPending: (post: Post, groupId: string) => void
	addApproved: (post: Post, groupId: string) => void
}

function createPostStore(): PostStore {
	const store = writable<PostData>({ data: new Map() })

	return {
		...store,
		addPending: (post: Post, groupId: string) => {
			store.update(({ data }) => {
				const personaPostData = data.get(groupId)

				if (personaPostData?.pending.find(({ postId }) => postId === post.postId)) {
					return { data }
				}

				const pending = [post, ...(personaPostData?.pending ?? [])]
				const approved = personaPostData?.approved ?? []
				data.set(groupId, { loading: false, approved, pending })

				return { data }
			})
		},
		addApproved: (post: Post, groupId: string) => {
			store.update(({ data }) => {
				const personaPostData = data.get(groupId)

				if (personaPostData?.approved.find(({ postId }) => postId === post.postId)) {
					return { data }
				}

				const pending = personaPostData?.pending ?? []
				const approved = [post, ...(personaPostData?.approved ?? [])]
				data.set(groupId, { loading: false, approved, pending })

				return { data }
			})
		},
	}
}

export const posts = createPostStore()
