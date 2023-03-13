import { chats, type Chat } from '$lib/stores/chat'
import { personas, type DraftPersona, type Persona } from '$lib/stores/persona'
import { getFromLocalStorage, saveToLocalStorage, sleep } from '$lib/utils'
import type { Adapter } from '.'

export class ZkitterAdapter implements Adapter {
	async start() {
		await sleep(1000)

		const chitChat = {
			identity: undefined,
			name: 'Chit Chat',
			pitch: 'We pretty much just say gm all the time.',
			description: 'We pretty much just say gm all the time.',
			participantsCount: 437,
			postsCount: 125,
			picture:
				'https://upload.wikimedia.org/wikipedia/commons/4/42/Chit_chat_%28256889331%29.jpg?20191121211426',
		}
		const expats = {
			identity: undefined,
			name: 'Expats',
			pitch: 'Different countries, same work...',
			description: 'Different countries, same work...',
			participantsCount: 81,
			postsCount: 4,
			picture: 'https://upload.wikimedia.org/wikipedia/commons/8/88/British_expats_countrymap.svg',
		}
		const cats = {
			identity: undefined,
			name: 'Cats',
			pitch: "Yeah it's the internet, what did you expect?",
			description: "Yeah it's the internet, what did you expect?",
			participantsCount: 839,
			postsCount: 5128,
			picture:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Adorable-animal-cat-20787.jpg/1599px-Adorable-animal-cat-20787.jpg?20180518085718',
		}
		const geoPolitics = {
			identity: undefined,
			name: 'Geo Politics',
			pitch: `Group full of "seen it all's"`,
			description: `Group full of "seen it all's"`,
			participantsCount: 109,
			postsCount: 53,
			picture:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/World_geopolitical_chess.png/1600px-World_geopolitical_chess.png?20200226194321',
		}
		const controversy = {
			identity: undefined,
			name: 'Controversy',
			pitch: '...',
			description: '...',
			participantsCount: 47,
			postsCount: 9999,
			picture:
				'https://upload.wikimedia.org/wikipedia/en/e/ea/Controversy_legend.gif?20060220215816',
		}

		const all = new Map<string, Persona>()
		all.set('1', chitChat)
		all.set('2', expats)
		all.set('3', cats)
		all.set('4', geoPolitics)
		all.set('5', controversy)

		const draft = getFromLocalStorage('drafts', [])
		const favorite = getFromLocalStorage('favorite', [])

		personas.set({ all, draft, favorite, loading: false })

		const chat1: Chat = {
			persona: controversy,
			post: {
				text: '[open] What if radiation is hoax?',
				timestamp: Date.now() - 9600000,
				images: [],
			},
			messages: [
				{
					text: 'What leads you to believe it could be a hoax?',
					timestamp: Date.now() - 3600000,
					myMessage: true,
				},
				{
					text: 'I mean it clearly is, just like there is no way planes can fly!',
					timestamp: Date.now() - 3000000,
				},
				{
					text: 'Please stop sharing clearly false information',
					timestamp: Date.now() - 1600000,
					myMessage: true,
				},
			],
		}

		const chat2: Chat = {
			persona: cats,
			post: {
				text: '[blocked] What does the cat say',
				timestamp: Date.now() - 19600000,
				images: ['https://via.placeholder.com/100x75'],
			},
			blocked: true,
			messages: [
				{
					text: 'Mňau, mňau',
					timestamp: Date.now() - 13600000,
					myMessage: true,
				},
				{
					text: 'What the hell is that language...',
					timestamp: Date.now() - 13000000,
				},
				{
					text: 'Czech',
					timestamp: Date.now() - 11600000,
					myMessage: true,
				},
				{
					text: 'Blocked the counterparty',
					timestamp: Date.now() - 11600000,
					system: true,
				},
			],
		}

		const chat3: Chat = {
			persona: expats,
			post: {
				text: "[closed] I'll want to learn Spanish, what is the best way to do so?",
				timestamp: Date.now() - 29600000,
				images: [
					'https://via.placeholder.com/100x75',
					'https://via.placeholder.com/105x321',
					'https://via.placeholder.com/119x321',
				],
			},
			closed: true,
			messages: [
				{
					text: 'What sort of level are you?',
					timestamp: Date.now() - 23600000,
					myMessage: true,
				},
				{
					text: 'Pretty much beginner TBH',
					timestamp: Date.now() - 23000000,
				},
				{
					text: 'Oh OK, then I would suggest to do a course. Maybe in Colombia, I think their Spanish is pretty nice!',
					timestamp: Date.now() - 21600000,
					myMessage: true,
				},
				{
					text: 'Thats quite nice suggestion! Thank you!',
					timestamp: Date.now() - 12600000,
				},
				{
					text: 'Closed the chat',
					timestamp: Date.now() - 12600000,
					system: true,
				},
			],
		}

		chats.update((state) => ({
			...state,
			chats: [chat1, chat2, chat3],
			loading: false,
			unread: 1,
		}))
	}
	addPersonaToFavorite(groupId: string): Promise<void> {
		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew = [...favorite, groupId]

				saveToLocalStorage('favorite', favoriteNew)

				resolve()
				return { ...store, favorite: favoriteNew }
			})
		})
	}
	removePersonaFromFavorite(groupId: string): Promise<void> {
		return new Promise((resolve) => {
			personas.update(({ favorite, ...store }) => {
				const favoriteNew = favorite.filter((s) => s !== groupId)

				saveToLocalStorage('favorite', favoriteNew)

				resolve()
				return { ...store, favorite: favoriteNew }
			})
		})
	}
	addPersonaDraft(draftPersona: DraftPersona): Promise<number> {
		return new Promise((resolve) =>
			personas.update(({ draft, ...state }) => {
				const newDraft = [...draft, draftPersona]

				saveToLocalStorage('drafts', newDraft)

				resolve(newDraft.length - 1)

				return { ...state, draft: newDraft }
			}),
		)
	}
	updatePersonaDraft(index: number, draftPersona: DraftPersona): Promise<void> {
		return new Promise((resolve) =>
			personas.update(({ draft, ...state }) => {
				draft[index] = draftPersona

				saveToLocalStorage('drafts', draft)

				resolve()

				return { ...state, draft }
			}),
		)
	}
}
