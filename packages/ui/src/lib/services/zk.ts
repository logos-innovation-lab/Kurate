import { ethers, Signer, type BigNumberish, type ContractTransaction } from 'ethers'
import { Group, type Member } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import {
	generateProof,
	packToSolidityProof,
	verifyProof,
	type FullProof,
} from '@semaphore-protocol/proof'

import zkeyFilePath from '$lib/assets/semaphore.zkey?url'
import wasmFilePath from '$lib/assets/semaphore.wasm?url'

import { GlobalAnonymousFeed__factory, type GlobalAnonymousFeed } from '$lib/assets/typechain'
import { GLOBAL_ANONYMOUS_FEED_ADDRESS, GROUP_ID } from '$lib/constants'
import { solidityKeccak256, type BytesLike, type Hexable } from 'ethers/lib/utils'
import type { PromiseOrValue } from '$lib/assets/typechain/common'

export async function createIdentity(signer: Signer, secret: string) {
	const identitySeed = await signer.signMessage(secret)
	return new Identity(identitySeed)
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
	message: string,
	externalNullifier: BytesLike | Hexable | number | bigint,
): Promise<FullProof> {
	const messageHash = solidityKeccak256(['string'], [message])

	return generateProof(identity, group, externalNullifier, messageHash, {
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
	const solidityProof = packToSolidityProof(fullProof.proof)

	return globalAnonymousFeed.sendMessage(
		message,
		fullProof.publicSignals.merkleTreeRoot,
		fullProof.publicSignals.nullifierHash,
		externalNullifier,
		solidityProof,
	)
}
