import { writable, type Writable } from 'svelte/store'
import type { Identity } from '@semaphore-protocol/identity'
import type { Post } from './post'

export interface Persona {
	identity?: Identity
	picture?: string
	cover?: string
	name: string
	pitch: string
	description: string
	participantsCount: number
	postsCount: number
	minReputation: 5 | 25 | 100 | 250 | 500
}

export interface DraftPersona extends Omit<Persona, 'postsCount' | 'participantsCount'> {
	posts: Post[]
}

type PersonaStore = {
	draft: DraftPersona[]
	favorite: string[]
	all: Map<string, Persona>
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
