import { writable, type Writable } from 'svelte/store'

export interface TokenData {
	go: number
	rep: number
	loading: boolean
}

export type TokenStore = Writable<TokenData>

function createTokenStore(): TokenStore {
	const store = writable<TokenData>({ go: 30, rep: 0, loading: false })

	return store
}

export const tokens = createTokenStore()
