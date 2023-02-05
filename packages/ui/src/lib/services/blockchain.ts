import { providers, Signer } from 'ethers'
import { TARGET_CHAIN_ID } from '$lib/constants'
import { browser } from '$app/environment'

type WindowWithEthereum = Window & typeof globalThis & { ethereum: providers.ExternalProvider }

export async function connectWallet(network?: providers.Networkish): Promise<Signer> {
	const provider = new providers.Web3Provider(getEthereum(), network)
	await provider.send('eth_requestAccounts', [])
	return provider.getSigner()
}

export function canConnectWallet() {
	return browser && Boolean((window as WindowWithEthereum)?.ethereum)
}

export function hasWallet(w?: Window & typeof globalThis): w is WindowWithEthereum {
	return browser && Boolean(((w ?? window) as WindowWithEthereum)?.ethereum)
}

export function getEthereum(): providers.ExternalProvider {
	if (hasWallet()) {
		return (window as WindowWithEthereum)?.ethereum
	}

	throw new Error('No web3 wallet found')
}

export async function checkNetwork(targetChainId = TARGET_CHAIN_ID) {
	if (!browser) return

	const ethereum = (window as WindowWithEthereum)?.ethereum
	if (ethereum && ethereum.request) {
		const currentChainId = await ethereum.request({
			method: 'eth_chainId',
		})

		if (Number.parseInt(currentChainId, 16) === Number.parseInt(targetChainId, 16)) {
			return true
		}
	}

	return false
}

export async function switchNetwork(targetChainId = TARGET_CHAIN_ID) {
	if (!browser) return

	const ethereum = (window as WindowWithEthereum)?.ethereum
	if (ethereum && ethereum.request) {
		await ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: targetChainId }],
		})

		// refresh
		window.location.reload()
	}
}
