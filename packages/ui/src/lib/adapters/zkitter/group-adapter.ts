import type { GlobalAnonymousFeed } from '$lib/assets/typechain'
import EventEmitter2, { type ConstructorOptions } from 'eventemitter2'
import { generateMerkleTree } from '@zk-kit/protocols'
import { providers } from 'ethers'
import { PROVIDER } from '$lib/constants'
import type { GenericDBAdapterInterface, GenericGroupAdapter } from 'zkitter-js'
import { GLOBAL_ANONYMOUS_FEED_ADDRESS } from '../../constants'

export class GroupAdapter extends EventEmitter2 implements GenericGroupAdapter {
	db: GenericDBAdapterInterface

	globalAnonymousFeed: GlobalAnonymousFeed

	groupId: string

	personaId: number

	lastSync = 0

	static createGroupId(personaId: number | string) {
		return `kurate_${GLOBAL_ANONYMOUS_FEED_ADDRESS}_${personaId}`
	}

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
		this.groupId = GroupAdapter.createGroupId(opts.personaId)
		this.personaId = opts.personaId
	}

	async sync() {
		if (Date.now() - this.lastSync < 60000) return
		const lastMemberIdCommitment = (await this.members()).pop()
		// FIXME: let's not use any in the codebase please
		const lastMember = await (this.db as any)
			.groupMembersDB(this.groupId)
			.get(lastMemberIdCommitment)
			.catch(() => null)
		const events = await this.globalAnonymousFeed
			.connect(new providers.JsonRpcProvider(PROVIDER))
			.queryFilter(
				this.globalAnonymousFeed.filters.NewPersonaMember(this.personaId),
				// lastMember?.blockNumber || 13980010,
				lastMember?.blockNumber || 0,
			)

		for (const event of events) {
			const identityCommitment = event.args.identityCommitment.toHexString()
			const tree = await this.tree()

			if (tree.indexOf(BigInt(identityCommitment)) < 0) {
				const member = {
					idCommitment: '0x' + BigInt(identityCommitment).toString(16),
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

		this.lastSync = Date.now()
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
