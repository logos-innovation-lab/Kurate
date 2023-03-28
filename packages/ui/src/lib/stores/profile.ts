import { writable, type Writable } from 'svelte/store'
import type { Signer } from 'ethers'
import type {ZkIdentity as UnirepIdentity} from "@unirep/utils";
import type {ZkIdentity} from "@zk-kit/identity";

export interface Profile {
	signer?: Signer
	address?: string
	unirepIdentity?: UnirepIdentity
	zkIdentity?: ZkIdentity
	ecdsa?: {
		pub: string
		priv: string
	}
}

export type ProfileStore = Writable<Profile>

function createProfileStore(): ProfileStore {
	return writable<Profile>({})
}

export const profile = createProfileStore()
