import type { GenericDBAdapterInterface } from './db'
import type { IncrementalMerkleTree } from '@zk-kit/incremental-merkle-tree'
import type EventEmitter2 from 'eventemitter2'

export interface GenericGroupAdapter extends EventEmitter2 {
	groupId: string
	db: GenericDBAdapterInterface
	sync: () => Promise<void>
	tree: () => Promise<IncrementalMerkleTree>
	members: () => Promise<string[]>
	verify: () => Promise<boolean>
}

export enum GroupEvents {
	GroupSynced = 'Group.GroupSynced',
	NewGroupMemberCreated = 'Group.NewGroupMemberCreated',
}
