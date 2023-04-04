import { writable, type Writable } from 'svelte/store'

export type TransactionType = 'publish persona' | 'promote' | 'demote' | 'publish post'

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
