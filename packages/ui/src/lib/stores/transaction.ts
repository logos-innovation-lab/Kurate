import { writable, type Writable } from 'svelte/store'

type TransactionType =
	| 'publish persona'
	| 'promote'
	| 'demote'
	| 'publish post'
	| 'vote_win'
	| 'post_included'
	| 'post_rejected'

export interface TransactionRecord {
	timestamp: number
	repChange: number
	goChange: number
	type: TransactionType
	personaId: string
}

export interface HistoryData {
	transactions: TransactionRecord[]
}

export type HistoryStore = Writable<HistoryData>

function createTokenStore(): HistoryStore {
	const store = writable<HistoryData>({ transactions: [] })

	return store
}

export const transaction = createTokenStore()
