import { writable, type Writable } from 'svelte/store'
import type { Identity } from '@semaphore-protocol/identity'
import type { DraftPost } from './post'
import type { ReputationOptions } from '$lib/types'

export interface Persona {
	personaId: string
	identity?: Identity
	picture: string
	cover: string
	name: string
	pitch: string
	description: string
	participantsCount: number
	postsCount: number
	minReputation: ReputationOptions
	timestamp: number
}

export interface DraftPersona
	extends Omit<Persona, 'postsCount' | 'participantsCount' | 'personaId'> {
	posts: DraftPost[]
}

type PersonaStore = {
	draft: DraftPersona[]
	favorite: string[]
	all: Map<string, Persona>
	loading: boolean
	error?: Error
}

function createPersonaStore(): Writable<PersonaStore> {
	const store = writable<PersonaStore>({
		all: new Map(),
		draft: [],
		favorite: [],
		loading: true,
	})

	return store
}

export const personas = createPersonaStore()
