import { GenericService } from '../utils/svc'
import type { GenericDBAdapterInterface } from '../adapters/db'
import type { Connection } from '../utils/message'
import type { ConstructorOptions } from 'eventemitter2'
import type { Proof } from '../models/proof'

export class ConnectionService extends GenericService {
	db: GenericDBAdapterInterface

	constructor(props: ConstructorOptions & { db: GenericDBAdapterInterface }) {
		super(props)
		this.db = props.db
	}

	async insert(connection: Connection, proof: Proof) {
		return this.db.insertConnection(connection, proof)
	}

	async getConnections(
		address: string,
		limit?: number,
		offset?: number | string,
	): Promise<Connection[]> {
		return this.db.getConnections(address, limit, offset)
	}
}
