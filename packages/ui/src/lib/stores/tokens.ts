import { DEFAULT_GO_AMOUNT } from '$lib/constants'
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
	timeToEpoch: number
}

export type TokenStore = Writable<TokenData>

function createTokenStore(): TokenStore {
	const epochDuration = 8 * 60 * 60 * 1000
	const store = writable<TokenData>({
		go: DEFAULT_GO_AMOUNT,
		repTotal: 55,
		repStaked: 0,
		loading: false,
		goHistoricalValues: [],
		repStakedHistoricalValues: [],
		repTotalHistoricalValues: [],
		epochDuration,
		timeToEpoch: epochDuration - (Date.now() % epochDuration),
	})

	return store
}

export const tokens = createTokenStore()
