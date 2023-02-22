import { ethers, providers, Signer, type BigNumberish, type ContractTransaction } from 'ethers'
import { Group, type Member } from '@semaphore-protocol/group'
import { generateProof, verifyProof, type FullProof } from '@semaphore-protocol/proof'
import { generateIdentity } from "zkitter-js";

const zkeyFilePath = ''
const wasmFilePath = ''

import { GlobalAnonymousFeed__factory, type GlobalAnonymousFeed } from '../assets/typechain'
import { GLOBAL_ANONYMOUS_FEED_ADDRESS, GROUP_ID } from '../constants'
import type { BytesLike, Hexable } from 'ethers/lib/utils'
import type { PromiseOrValue } from '../assets/typechain/common'
import { Strategy, ZkIdentity } from '@zk-kit/identity';
import {generateECDHKeyPairFromhex, sha256, signWithP256} from "../utils/crypto";

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

	const ecdhseed = await signWithP256(identity.priv, 'signing for ecdh - 0');
	const ecdhHex = await sha256(ecdhseed);
	const keyPair = await generateECDHKeyPairFromhex(ecdhHex);

	const zkseed = await signWithP256(identity.priv, 'signing for zk identity - 0');
	const zkHex = await sha256(zkseed);
	const zkIdentity = new ZkIdentity(Strategy.MESSAGE, zkHex);

	return {
		zkIdentity,
		ecdh: keyPair,
	};
}

export function getGlobalAnonymousFeed(signer?: Signer): GlobalAnonymousFeed {
	return new GlobalAnonymousFeed__factory(signer).attach(GLOBAL_ANONYMOUS_FEED_ADDRESS)
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

export async function joinGroupOnChain(
	globalAnonymousFeed: GlobalAnonymousFeed,
	identityCommitment: Member,
): Promise<ContractTransaction> {
	return globalAnonymousFeed.joinGroup(identityCommitment)
}

export function getRandomExternalNullifier() {
	return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(crypto.randomUUID()))
}

export async function generateGroupProof(
	group: Group,
	identity: Identity,
	signal: string,
	externalNullifier: BytesLike | Hexable | number | bigint,
): Promise<FullProof> {
	return generateProof(identity, group, externalNullifier, signal, {
		zkeyFilePath,
		wasmFilePath,
	})
}

export async function validateProofOffChain(proof: FullProof, treeDepth = 20): Promise<boolean> {
	return verifyProof(proof, treeDepth)
}

export function validateProofOnChain(
	globalAnonymousFeed: GlobalAnonymousFeed,
	fullProof: FullProof,
	message: string,
	externalNullifier: PromiseOrValue<BigNumberish>,
): Promise<ContractTransaction> {
	return globalAnonymousFeed.sendMessage(
		message,
		fullProof.merkleTreeRoot,
		fullProof.nullifierHash,
		externalNullifier,
		fullProof.proof,
	)
}
