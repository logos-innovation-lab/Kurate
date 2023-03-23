import { GenericService } from '../utils/svc'
import type { GenericDBAdapterInterface } from '../adapters/db'
import type { Profile } from '../utils/message'
import type { ConstructorOptions } from 'eventemitter2'
import type { Proof } from '../models/proof'

export class ProfileService extends GenericService {
	db: GenericDBAdapterInterface

	constructor(props: ConstructorOptions & { db: GenericDBAdapterInterface }) {
		super(props)
		this.db = props.db
	}

	async insert(profile: Profile, proof: Proof) {
		if (!profile.creator) return
		return this.db.insertProfile(profile, proof)
	}
}
