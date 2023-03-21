import { providers, Signer } from 'ethers'

import { GlobalAnonymousFeed__factory, type GlobalAnonymousFeed } from '$lib/assets/typechain'
import { GLOBAL_ANONYMOUS_FEED_ADDRESS } from '$lib/constants'
import { browser } from '$app/environment'

type WindowWithEthereum = Window &
	typeof globalThis & { ethereum: providers.ExternalProvider | providers.JsonRpcFetchFunc }

export async function connectWallet(network?: providers.Networkish): Promise<Signer> {
	const provider = new providers.Web3Provider((window as WindowWithEthereum).ethereum, network)
	await provider.send('eth_requestAccounts', [])
	return provider.getSigner()
}

export function canConnectWallet() {
	return browser && Boolean((window as WindowWithEthereum)?.ethereum)
}

export function getGlobalAnonymousFeed(signer?: Signer): GlobalAnonymousFeed {
	return new GlobalAnonymousFeed__factory(signer).attach(GLOBAL_ANONYMOUS_FEED_ADDRESS)
}
