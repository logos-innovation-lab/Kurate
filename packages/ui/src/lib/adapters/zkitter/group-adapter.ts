import type { GlobalAnonymousFeed } from '$lib/assets/typechain'
import EventEmitter2, { type ConstructorOptions } from 'eventemitter2'
import { generateMerkleTree } from '@zk-kit/protocols'
import { providers } from 'ethers'
import { PROVIDER } from '$lib/constants'
import type { GenericDBAdapterInterface, GenericGroupAdapter } from 'zkitter-js'

export class GroupAdapter extends EventEmitter2 implements GenericGroupAdapter {
	db: GenericDBAdapterInterface

	globalAnonymousFeed: GlobalAnonymousFeed

	groupId: string

	personaId: number

	constructor(
		opts: {
			db: GenericDBAdapterInterface
			globalAnonymousFeed: GlobalAnonymousFeed
			personaId: number
		} & ConstructorOptions,
	) {
		super(opts)
		this.db = opts.db
		this.globalAnonymousFeed = opts.globalAnonymousFeed
		this.groupId = `kurate_${opts.personaId}`
		this.personaId = opts.personaId
	}

	async sync() {
		const lastMemberIdCommitment = (await this.members()).pop()
		// TODO: expose method in new zkitter-js release
		// @ts-ignore
		const lastMember = await this.db
			.groupMembersDB(this.groupId)
			.get(lastMemberIdCommitment)
			.catch(() => null)
		const events = await this.globalAnonymousFeed
			.connect(new providers.JsonRpcProvider(PROVIDER))
			.queryFilter(
				this.globalAnonymousFeed.filters.NewPersonaMember(this.personaId),
				lastMember?.blockNumber || 13980010,
			)

		for (const event of events) {
			const identityCommitment = event.args.identityCommitment.toHexString()
			const tree = await this.tree()

			if (tree.indexOf(BigInt(identityCommitment)) < 0) {
				const member = {
					idCommitment: identityCommitment,
					newRoot: '',
					index: tree.leaves.length,
					blockNumber: event.blockNumber,
				}
				tree.insert(BigInt(identityCommitment))
				member.newRoot = tree.root.toString()
				await this.db.insertGroupMember(this.groupId, member)
				this.emit('Group.NewGroupMemberCreated', member, this.groupId)
			}
		}
	}

	async tree() {
		const tree = generateMerkleTree(15, BigInt(0), await this.members())
		return tree
	}

	async members(): Promise<string[]> {
		return this.db.getGroupMembers(this.groupId).catch(() => [])
	}

	async verify(): Promise<boolean> {
		return false
	}
}
