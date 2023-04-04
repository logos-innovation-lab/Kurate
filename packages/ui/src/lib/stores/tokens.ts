import { writable, type Writable } from 'svelte/store'

export interface TokenData {
	go: number
	repTotal: number
	repStaked: number
	loading: boolean
	epochDuration: number
	timeToEpoch: number
}

export type TokenStore = Writable<TokenData>

function createTokenStore(): TokenStore {
	const epochDuration = 8 * 60 * 60 * 1000
	const store = writable<TokenData>({
		go: 0,
		repTotal: 0,
		repStaked: 0,
		loading: false,
		epochDuration,
		timeToEpoch: epochDuration - (Date.now() % epochDuration),
	})

	return store
}

export const tokens = createTokenStore()
