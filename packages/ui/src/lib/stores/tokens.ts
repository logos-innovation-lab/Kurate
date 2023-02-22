import { writable, type Writable } from 'svelte/store'

export interface TokenData {
	go: number
	repTotal: number
	repStaked: number
	loading: boolean
}

export type TokenStore = Writable<TokenData>

function createTokenStore(): TokenStore {
	const store = writable<TokenData>({ go: 30, repTotal: 10, repStaked: 5, loading: false })

	return store
}

export const tokens = createTokenStore()
