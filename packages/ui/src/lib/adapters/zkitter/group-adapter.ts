import type { GlobalAnonymousFeed } from '$lib/assets/typechain'
import EventEmitter2, { type ConstructorOptions } from 'eventemitter2'
import { generateMerkleTree } from '@zk-kit/protocols'
import { browser } from '$app/environment'
import { providers } from 'ethers'
import { PROVIDER } from '$lib/constants'
import type { GenericDBAdapterInterface } from 'zkitter-js'

const LS_KEY_GROUP_IDS = 'kurate/groupIds'

export class GroupAdapter extends EventEmitter2 {
	db: GenericDBAdapterInterface

	globalAnonymousFeed: GlobalAnonymousFeed

	groupId = 'kurate'

	groups: {
		[groupId: string]: string
	}

	constructor(
		opts: {
			db: GenericDBAdapterInterface
			globalAnonymousFeed: GlobalAnonymousFeed
		} & ConstructorOptions,
	) {
		super(opts)
		this.db = opts.db
		this.globalAnonymousFeed = opts.globalAnonymousFeed
		this.groups = {}
		this._loadGroupIdsFromLS()
	}

	_loadGroupIdsFromLS() {
		let groups: any // FIXME: I don't like using any

		try {
			groups = JSON.parse(localStorage.getItem(LS_KEY_GROUP_IDS) || '{}')
		} catch (e) {
			groups = {}
		}

		this.groups = groups
	}

	_persistGroupIds(groups: { [groupId: string]: string }) {
		if (browser && localStorage) {
			localStorage.setItem(LS_KEY_GROUP_IDS, JSON.stringify(groups))
		}
	}

	async sync() {
		const data: {
			[groupId: string]: string[]
		} = {}

		const newIdentityEvents = await this.globalAnonymousFeed
			.connect(new providers.JsonRpcProvider(PROVIDER))
			.queryFilter(this.globalAnonymousFeed.filters.NewIdentity())

		for (const event of newIdentityEvents) {
			const groupId = ['kurate', event.args.groupId.toHexString()].join('_')
			const identityCommitment = event.args.identityCommitment.toHexString()

			data[groupId] = data[groupId] || []
			data[groupId].push(identityCommitment)
		}

		for (const groupId of Object.keys(data)) {
			const tree = await this.tree(groupId)
			const commitments = data[groupId]

			for (let i = 0; i < commitments.length; i++) {
				const identityCommitment = commitments[i]

				if (tree.indexOf(BigInt(identityCommitment)) < 0) {
					tree.insert(BigInt(identityCommitment))
					const member = {
						idCommitment: identityCommitment,
						newRoot: tree.root.toString(),
						index: i,
					}
					await this.db.insertGroupMember(groupId, member)
					this.emit('Group.NewGroupMemberCreated', member, groupId)
				}
			}
		}

		this._persistGroupIds(
			Object.keys(data).reduce((map: any, groupId: string) => {
				// FIXME: I don't like using any
				map[groupId] = groupId
				return map
			}, {}),
		)
	}

	async tree(groupId: string) {
		const tree = generateMerkleTree(15, BigInt(0), await this.members(groupId))

		return tree
	}

	async members(groupId: string): Promise<string[]> {
		return this.db.getGroupMembers(groupId)
	}
}
