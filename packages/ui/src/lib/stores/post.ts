import { writable, type Writable } from 'svelte/store'
import { browser } from '$app/environment'
import { getGlobalAnonymousFeed } from '$lib/services'
import { providers } from 'ethers'
import { PROVIDER } from '$lib/constants'

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

async function pullFeed() {
	try {
		const provider = new providers.JsonRpcProvider(PROVIDER)
		if (provider) {
			const contract = getGlobalAnonymousFeed().connect(provider)
			const events = await contract.queryFilter(contract.filters.NewMessage())
			const messages: Post[] = events.map((e) => ({
				text: e.args.message,
				tx: e.transactionHash,
				timestamp: e.blockNumber,
			}))
			posts.set({ posts: messages.reverse(), loading: false })

			if (browser) {
				localStorage.setItem('messages', JSON.stringify(messages))
			}
		}
	} catch (e) {
		console.error(e)
	}
}

function createPostStore(): PostStore {
	let posts: Post[] = []
	const loading = false
	if (browser) {
		const messages = localStorage.getItem('messages')

		if (messages) {
			posts = JSON.parse(messages)
		}
	}
	const store = writable<PostData>({ posts, loading })
	pullFeed()

	return {
		...store,
		add: (post: Post) => {
			store.update(({ posts, loading }) => {
				const newPosts = [post, ...posts]

				if (browser) {
					localStorage.setItem('messages', JSON.stringify(newPosts))
				}

				return { loading, posts: newPosts }
			})
		},
	}
}

export const posts = createPostStore()
