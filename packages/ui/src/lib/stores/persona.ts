import { writable, type Writable } from 'svelte/store'
import type { Identity } from '@semaphore-protocol/identity'
import type { Post } from './post'
import { browser } from '$app/environment'

export interface Persona {
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
	all: Map<string, Persona>
	loading: boolean
}

export interface PersonaStoreWritable extends Writable<PersonaStore> {
	addDraft: (draft: DraftPersona) => Promise<number>
	updateDraft: (index: number, draft: DraftPersona) => void
}

function createPersonaStore(): PersonaStoreWritable {
	const store = writable<PersonaStore>({
		all: new Map(),
		draft: browser && localStorage ? JSON.parse(localStorage.getItem('drafts') ?? '[]') : [],
		favorite: [],
		loading: true,
	})

	return {
		...store,
		addDraft: (draftPersona: DraftPersona) => {
			return new Promise((resolve) =>
				store.update(({ draft, ...state }) => {
					const newDraft = [...draft, draftPersona]

					if (browser && localStorage) {
						localStorage.setItem('drafts', JSON.stringify(newDraft))
					}

					resolve(newDraft.length - 1)

					return { ...state, draft: newDraft }
				}),
			)
		},
		updateDraft: (index: number, draftPersona: DraftPersona) => {
			store.update(({ draft, ...state }) => {
				draft[index] = draftPersona

				if (browser && localStorage) {
					localStorage.setItem('drafts', JSON.stringify(draft))
				}

				return { ...state, draft }
			})
		},
	}
}

export const personas = createPersonaStore()
