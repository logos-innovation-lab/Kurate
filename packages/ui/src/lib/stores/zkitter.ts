import { writable, type Writable } from 'svelte/store'
import { Zkitter } from 'zkitter-js'

interface ZkitterData {
	client?: Zkitter
}

export type ZkitterStore = Writable<ZkitterData>

function createZkitterStore(): ZkitterStore {
	const store = writable<ZkitterData>({})

	Zkitter.initialize().then((zkitter) => {
		store.update((state) => ({ ...state, client: zkitter }))
	})

	return store
}

export const zkitter = createZkitterStore()
