import { writable, type Writable } from 'svelte/store'
import { getWaku } from '$lib/services/waku'
import { subscribeToPosts } from '$lib/services/posts'

export interface Post {
	timestamp: number
	text: string
	tx: string
}

interface PostData {
	posts: Post[]
	loading: boolean
}

export interface PostStore extends Writable<PostData> {
	add: (post: Post) => void
}

async function fetchPosts() {
	// TODO: Move this to some global store / injected depencency somehow
	const waku = await getWaku()

	// Fetch posts
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const unsubscribe = await subscribeToPosts(
		waku,
		(post) => {
			posts.add({
				text: post.text,
				timestamp: Date.now(),
				tx: '',
			})
		},
		undefined,
		() => posts.update((state) => ({ ...state, loading: false })),
	)
}

function createPostStore(): PostStore {
	const store = writable<PostData>({ posts: [], loading: true })
	fetchPosts()

	return {
		...store,
		add: (post: Post) => {
			store.update(({ posts, ...state }) => {
				const newPosts = [post, ...posts]
				return { ...state, posts: newPosts }
			})
		},
	}
}

export const posts = createPostStore()
