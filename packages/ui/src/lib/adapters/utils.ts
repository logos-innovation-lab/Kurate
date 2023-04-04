import { browser } from '$app/environment'
import { chats, type Chat } from '$lib/stores/chat'
import { personas } from '$lib/stores/persona'
import { profile } from '$lib/stores/profile'
import { tokens } from '$lib/stores/tokens'
import { transaction } from '$lib/stores/transaction'
import type { providers } from 'ethers'

type WindowWithEthereum = Window &
	typeof globalThis & { ethereum: providers.ExternalProvider | any }

const windowWithEthereum = browser && (window as WindowWithEthereum)

function onAccountChanged() {
	// Clear profile
	profile.set({})

	// Clear personas
	personas.update((state) => ({ ...state, draft: [] }))

	// Clear tokens
	tokens.update((state) => ({
		...state,
		go: 0,
		repStaked: 0,
		repTotal: 0,
		loading: true,
	}))

	// Clear chats
	chats.set({ chats: new Map<string, Chat>(), loading: true, unread: 0 })

	// Clear transactions
	transaction.set({ transactions: [] })
}

export function subscribeAccountChanged(): () => unknown {
	if (
		windowWithEthereum &&
		windowWithEthereum.ethereum &&
		typeof windowWithEthereum.ethereum.on === 'function'
	) {
		windowWithEthereum.ethereum.on('accountsChanged', onAccountChanged)
		return () => {
			windowWithEthereum &&
				windowWithEthereum.ethereum.removeListener('accountsChanged', onAccountChanged)
		}
	}
	return () => console.error('No ethereum provider')
}

function onChainChanged() {
	browser && window.location.reload()
}

export function subscribeChainChanged() {
	if (
		windowWithEthereum &&
		windowWithEthereum.ethereum &&
		typeof windowWithEthereum.ethereum.on === 'function'
	) {
		windowWithEthereum.ethereum.on('chainChanged', onChainChanged)

		return () => {
			windowWithEthereum &&
				windowWithEthereum &&
				windowWithEthereum.ethereum.removeListener('chainChanged', onChainChanged)
		}
	}
	return () => console.error('No ethereum provider')
}
