import { writable, type Writable } from 'svelte/store'

interface TokenValues {
	timestamp: number
	value: number
}

export interface TokenData {
	go: number
	repTotal: number
	repStaked: number
	loading: boolean
	goHistoricalValues: TokenValues[]
	repStakedHistoricalValues: TokenValues[]
	repTotalHistoricalValues: TokenValues[]
	epochDuration: number
}

export type TokenStore = Writable<TokenData>

function createTokenStore(): TokenStore {
	const store = writable<TokenData>({
		go: 30,
		repTotal: 55,
		repStaked: 5,
		loading: false,
		goHistoricalValues: [],
		repStakedHistoricalValues: [],
		repTotalHistoricalValues: [],
		epochDuration: 8 * 60 * 60 * 1000,
	})

	return store
}

export const tokens = createTokenStore()
