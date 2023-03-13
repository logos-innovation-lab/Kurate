import { ZkitterAdapter } from './zkitter'
import type { DraftPersona, Persona } from '$lib/stores/persona'

export interface Adapter {
	start?: () => Promise<void>
	stop?: () => Promise<void>
	addPersonaToFavorite: (groupId: string, persona?: Persona) => Promise<void>
	removePersonaFromFavorite: (groupId: string, persona?: Persona) => Promise<void>
	addPersonaDraft: (draftPersona: DraftPersona) => Promise<number>
	updatePersonaDraft: (index: number, draftPersona: DraftPersona) => Promise<void>
}

export default new ZkitterAdapter() as Adapter
