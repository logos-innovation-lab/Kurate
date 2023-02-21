import { ethers, providers, Signer, type ContractTransaction } from 'ethers'
import { Group, type Member } from '@semaphore-protocol/group'
import { verifyProof, type FullProof } from '@semaphore-protocol/proof'
import { generateIdentity } from 'zkitter-js'

import { GlobalAnonymousFeed__factory, type GlobalAnonymousFeed } from '../assets/typechain'
import { GLOBAL_ANONYMOUS_FEED_ADDRESS, GROUP_ID } from '../constants'
import { Strategy, ZkIdentity } from '@zk-kit/identity'
import { generateECDHKeyPairFromhex, sha256, signWithP256 } from '../utils/crypto'

type WindowWithEthereum = Window &
	typeof globalThis & { ethereum: providers.ExternalProvider | providers.JsonRpcFetchFunc }

export async function connectWallet(network?: providers.Networkish): Promise<Signer> {
	const provider = new providers.Web3Provider((window as WindowWithEthereum).ethereum, network)
	await provider.send('eth_requestAccounts', [])
	return provider.getSigner()
}

export function canConnectWallet() {
	return Boolean((window as WindowWithEthereum)?.ethereum)
}

export async function createIdentity(signer: Signer, nonce = 0) {
	const identity = await generateIdentity(nonce, signer.signMessage.bind(signer))

	const ecdhseed = await signWithP256(identity.priv, 'signing for ecdh - 0')
	const ecdhHex = await sha256(ecdhseed)
	const keyPair = await generateECDHKeyPairFromhex(ecdhHex)

	const zkseed = await signWithP256(identity.priv, 'signing for zk identity - 0')
	const zkHex = await sha256(zkseed)
	const zkIdentity = new ZkIdentity(Strategy.MESSAGE, zkHex)

	return {
		zkIdentity,
		ecdh: keyPair,
	}
}

export function getGlobalAnonymousFeed(signer?: Signer): GlobalAnonymousFeed {
	return new GlobalAnonymousFeed__factory(signer).attach(GLOBAL_ANONYMOUS_FEED_ADDRESS)
}

export async function fetchGroups(
	globalAnonymousFeedContract: GlobalAnonymousFeed,
): Promise<string[]> {
	const events = await globalAnonymousFeedContract.queryFilter(
		globalAnonymousFeedContract.filters.NewGroup(null),
	)

	return events.map((e) => {
		return e.args.groupId.toHexString()
	})
}

export async function getContractGroup(
	globalAnonymousFeedContract: GlobalAnonymousFeed,
): Promise<Group> {
	const group = new Group(GROUP_ID)

	const events = await globalAnonymousFeedContract.queryFilter(
		globalAnonymousFeedContract.filters.NewIdentity(null),
	)

	group.addMembers(events.map((e) => e.args.identityCommitment.toBigInt()))
	return group
}

export function joinGroupOffChain(group: Group, member: Member): void {
	group.addMember(member)
}

export async function createNewPersona(
	globalAnonymousFeed: GlobalAnonymousFeed,
	identityCommitment: string,
): Promise<ContractTransaction> {
	const randBuf = crypto.getRandomValues(new Uint8Array(32))
	const hex = '0x' + Buffer.from(randBuf).toString('hex')
	return globalAnonymousFeed.createAndJoin(hex, identityCommitment)
}

export async function joinGroupOnChain(
	globalAnonymousFeed: GlobalAnonymousFeed,
	groupId: string,
	identityCommitment: string,
): Promise<ContractTransaction> {
	return globalAnonymousFeed.joinGroup(groupId, identityCommitment)
}

export function getRandomExternalNullifier() {
	return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(crypto.randomUUID()))
}

export async function validateProofOffChain(proof: FullProof, treeDepth = 20): Promise<boolean> {
	return verifyProof(proof, treeDepth)
}
