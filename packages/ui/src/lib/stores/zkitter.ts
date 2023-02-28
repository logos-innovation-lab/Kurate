import { browser } from '$app/environment'
import { writable, type Writable } from 'svelte/store'
import * as ZK from 'zkitter-js'

interface ZkitterData {
	client?: ZK.Zkitter
}

export type ZkitterStore = Writable<ZkitterData>

function createZkitterStore(): ZkitterStore {
	const store = writable<ZkitterData>({})

	// FIXME: figure out why ZK can sometimes be undefined
	if (browser && ZK) {
		ZK.Zkitter.initialize().then((zkitter) => {
			store.update((state) => ({ ...state, client: zkitter }))
		})
	}

	return store
}

export const zkitter = createZkitterStore()
