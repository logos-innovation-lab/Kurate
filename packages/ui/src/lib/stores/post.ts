import { writable, type Writable } from 'svelte/store'

export interface Post {
	timestamp: number
	text: string
	images: string[]
	yourVote?: '+' | '-'
}

interface PostData {
	data: Map<string, { approved: Post[]; pending: Post[]; loading: boolean }>
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
				data.set(groupId, { loading, approved, pending })

				return { data }
			})
		},
		addPending: (post: Post, groupId: string) => {
			store.update(({ data }) => {
				const personaPostData = data.get(groupId)
				const pending = [post, ...(personaPostData?.pending ?? [])]
				const approved = personaPostData?.approved ?? []
				data.set(groupId, { loading: false, approved, pending })

				return { data }
			})
		},
		addApproved: (post: Post, groupId: string) => {
			store.update(({ data }) => {
				const personaPostData = data.get(groupId)
				const pending = personaPostData?.pending ?? []
				const approved = [post, ...(personaPostData?.approved ?? [])]
				data.set(groupId, { loading: false, approved, pending })

				return { data }
			})
		},
	}
}

export const posts = createPostStore()
