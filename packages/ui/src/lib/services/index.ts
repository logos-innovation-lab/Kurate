import { providers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'

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

export async function createIdentity(signer: providers.JsonRpcSigner, secret: string) {
	const identitySeed = await signer.signMessage(secret)
	return new Identity(identitySeed)
}
