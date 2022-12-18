import { writable, type Writable } from 'svelte/store'
import type { User } from './user'
import { providers } from 'ethers'

type WindowWithEthereum = Window &
	typeof globalThis & { ethereum: providers.ExternalProvider | providers.JsonRpcFetchFunc }

export interface Profile {
	signer?: providers.JsonRpcSigner
	profiles: User[]
	active?: User
}

export interface ProfileStore extends Writable<Profile> {
	setActive: (user: User) => void
	getSigner: () => Promise<void>
}

function createProfileStore(): ProfileStore {
	const store = writable<Profile>({ profiles: [], active: undefined })

	return {
		...store,
		setActive: (user: User) => {
			store.update((profile) => ({ ...profile, active: user }))
		},
		getSigner: async () => {
			const provider = new providers.Web3Provider((window as WindowWithEthereum).ethereum)
			await provider.send('eth_requestAccounts', [])
			const signer = provider.getSigner()

			store.update((profile) => ({ ...profile, signer }))
		},
	}
}

export const profile = createProfileStore()
