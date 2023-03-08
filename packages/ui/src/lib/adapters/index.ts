import { ZkitterAdapter } from './zkitter'

export interface Adapter {
	start?: () => Promise<void>
	stop?: () => Promise<void>
}

export default new ZkitterAdapter() as Adapter
