import { writable, type Writable } from 'svelte/store'
import type { Identity } from '@semaphore-protocol/identity'
import type { Post } from './post'

export interface Persona {
	personaId: number
	identity?: Identity
	picture?: string
	cover?: string
	name: string
	pitch: string
	description: string
	participantsCount: number
	postsCount: number
}

export interface DraftPersona extends Omit<Persona, 'postsCount' | 'participantsCount'> {
	posts: Post[]
}

type PersonaStore = {
	draft: DraftPersona[]
	favorite: string[]
	all: Map<number, Persona>
	loading: boolean
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
