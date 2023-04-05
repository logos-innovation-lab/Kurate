import { writable, type Writable } from 'svelte/store'

export interface DraftPost {
	timestamp: number
	text: string
	images: string[]
}

export interface Post extends DraftPost {
	postId: string
	myPost?: boolean
}

export interface PostPending extends Post {
	yourVote?: '+' | '-'
}

interface PostData {
	data: Map<string, { approved: Post[]; pending: PostPending[]; loading: boolean; error?: Error }>
}

export interface PostStore extends Writable<PostData> {
	addPending: (post: PostPending, groupId: string) => void
	addApproved: (post: Post, groupId: string) => void
}

function createPostStore(): PostStore {
	const store = writable<PostData>({ data: new Map() })

	return {
		...store,
		addPending: (post: PostPending, groupId: string) => {
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
