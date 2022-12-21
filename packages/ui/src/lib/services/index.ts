import { providers } from 'ethers'

type WindowWithEthereum = Window &
	typeof globalThis & { ethereum: providers.ExternalProvider | providers.JsonRpcFetchFunc }

export async function connectWallet(network?: providers.Networkish) {
	const provider = new providers.Web3Provider((window as WindowWithEthereum).ethereum, network)
	await provider.send('eth_requestAccounts', [])
	return provider.getSigner()
}

export function canConnectWallet() {
	return Boolean((window as WindowWithEthereum)?.ethereum)
}
