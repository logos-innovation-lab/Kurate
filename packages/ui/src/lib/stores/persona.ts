import { writable, type Writable } from 'svelte/store'
import type { Identity } from '@semaphore-protocol/identity'
import { GROUP_ID } from '$lib/constants'

interface Persona {
	identity?: Identity
	picture?: string
	description: string
	postsCount: number
	groupId: string
}

export type PersonaStore = Writable<{
	personas: Map<string, Persona>
	loading: boolean
}>

function createPersonaStore(): PersonaStore {
	const personas = new Map<string, Persona>()
	personas.set('chit chat', {
		identity: undefined,
		description: 'We pretty much just say gm all the time.',
		postsCount: 125,
		groupId: GROUP_ID,
		picture:
			'https://upload.wikimedia.org/wikipedia/commons/4/42/Chit_chat_%28256889331%29.jpg?20191121211426',
	})
	personas.set('expats', {
		identity: undefined,
		description: 'Different countries, same work...',
		postsCount: 4,
		groupId: GROUP_ID,
		picture: 'https://upload.wikimedia.org/wikipedia/commons/8/88/British_expats_countrymap.svg',
	})
	personas.set('cats', {
		identity: undefined,
		description: "Yeah it's the internet, what did you expect?",
		postsCount: 5128,
		groupId: GROUP_ID,
		picture:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Adorable-animal-cat-20787.jpg/1599px-Adorable-animal-cat-20787.jpg?20180518085718',
	})
	personas.set('geo politics', {
		identity: undefined,
		description: `Group full of "seen it all's"`,
		postsCount: 53,
		groupId: GROUP_ID,
		picture:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/World_geopolitical_chess.png/1600px-World_geopolitical_chess.png?20200226194321',
	})
	personas.set('controversy', {
		identity: undefined,
		description: '...',
		postsCount: 9999,
		groupId: GROUP_ID,
		picture: 'https://upload.wikimedia.org/wikipedia/en/e/ea/Controversy_legend.gif?20060220215816',
	})

	const store = writable({ personas: new Map(), loading: true })

	setTimeout(() => store.set({ personas, loading: false }), 1000)

	return store
}

export const personas = createPersonaStore()
