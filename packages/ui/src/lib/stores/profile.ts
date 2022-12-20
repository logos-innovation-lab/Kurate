import { writable, type Writable } from 'svelte/store'
import type { User } from './user'
import { providers } from 'ethers'

type WindowWithEthereum = Window &
	typeof globalThis & { ethereum: providers.ExternalProvider | providers.JsonRpcFetchFunc }

export interface Profile {
	signer?: providers.JsonRpcSigner
	error?: Error
	profiles: User[]
	active?: User
}

export interface ProfileStore extends Writable<Profile> {
	setActive: (user: User) => void
	getSigner: (network?: providers.Networkish) => Promise<void>
}

export const canConnect = () => Boolean((window as WindowWithEthereum).ethereum)

function createProfileStore(): ProfileStore {
	const store = writable<Profile>({ profiles: [], active: undefined })

	return {
		...store,
		setActive: (user: User) => {
			store.update((profile) => ({ ...profile, active: user }))
		},
		getSigner: async (network) => {
			try {
				const provider = new providers.Web3Provider(
					(window as WindowWithEthereum).ethereum,
					network,
				)
				await provider.send('eth_requestAccounts', [])
				const signer = provider.getSigner()

				store.update((profile) => ({ ...profile, signer, error: undefined }))
			} catch (error) {
				store.update((profile) => ({ ...profile, signer: undefined, error: error as Error }))
			}
		},
	}
}

export const profile = createProfileStore()
