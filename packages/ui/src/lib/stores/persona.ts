import { writable, type Writable } from 'svelte/store'
import type { Identity } from '@semaphore-protocol/identity'
import type { Post } from './post'
import { browser } from '$app/environment'

interface Persona {
	identity?: Identity
	picture?: string
	cover?: string
	name: string
	pitch: string
	description: string
	postsCount: number
}

export interface DraftPersona extends Partial<Omit<Persona, 'postsCount'>> {
	posts: Post[]
}

type PersonaStore = {
	draft: DraftPersona[]
	favorite: Map<string, Persona>
	all: Map<string, Persona>
	loading: boolean
}

export interface PersonaStoreWritable extends Writable<PersonaStore> {
	addDraft: (draft: DraftPersona) => void
	updateDraft: (index: number, draft: DraftPersona) => void
}

function createPersonaStore(): PersonaStoreWritable {
	const store = writable<PersonaStore>({
		all: new Map(),
		draft: browser && localStorage ? JSON.parse(localStorage.getItem('drafts') ?? '[]') : [],
		favorite: new Map(),
		loading: true,
	})

	setTimeout(() => {
		const chitChat = {
			identity: undefined,
			name: 'Chit Chat',
			pitch: 'We pretty much just say gm all the time.',
			description: 'We pretty much just say gm all the time.',
			postsCount: 125,
			picture:
				'https://upload.wikimedia.org/wikipedia/commons/4/42/Chit_chat_%28256889331%29.jpg?20191121211426',
		}
		const expats = {
			identity: undefined,
			name: 'Expats',
			pitch: 'Different countries, same work...',
			description: 'Different countries, same work...',
			postsCount: 4,
			picture: 'https://upload.wikimedia.org/wikipedia/commons/8/88/British_expats_countrymap.svg',
		}
		const cats = {
			identity: undefined,
			name: 'Cats',
			pitch: "Yeah it's the internet, what did you expect?",
			description: "Yeah it's the internet, what did you expect?",
			postsCount: 5128,
			picture:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Adorable-animal-cat-20787.jpg/1599px-Adorable-animal-cat-20787.jpg?20180518085718',
		}
		const geoPolitics = {
			identity: undefined,
			name: 'Geo Politics',
			pitch: `Group full of "seen it all's"`,
			description: `Group full of "seen it all's"`,
			postsCount: 53,
			picture:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/World_geopolitical_chess.png/1600px-World_geopolitical_chess.png?20200226194321',
		}
		const controversy = {
			identity: undefined,
			name: 'Controversy',
			pitch: '...',
			description: '...',
			postsCount: 9999,
			picture:
				'https://upload.wikimedia.org/wikipedia/en/e/ea/Controversy_legend.gif?20060220215816',
		}

		const all = new Map<string, Persona>()
		const favorite = new Map<string, Persona>()
		all.set('1', chitChat)
		all.set('2', expats)
		all.set('3', cats)
		all.set('4', geoPolitics)
		all.set('5', controversy)

		favorite.set('3', cats)
		favorite.set('4', controversy)

		store.update((state) => ({ ...state, all, favorite, loading: false }))
	}, 1000)

	return {
		...store,
		addDraft: (draftPersona: DraftPersona) => {
			store.update(({ draft, ...state }) => {
				const newDraft = [...draft, draftPersona]

				if (browser && localStorage) {
					localStorage.setItem('drafts', JSON.stringify(newDraft))
				}

				return { ...state, draft: newDraft }
			})
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
