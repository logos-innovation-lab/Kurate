import { browser } from '$app/environment'

type JSONdecoded = string | number | boolean | object | Array<JSONdecoded>

export type SavedSeedMessages = {
	personaId: number;
	serializedMessages: string[];
	idCommitment: string;
}
/**
 * Sleep for N miliseconds
 *
 * @param ms Number of miliseconds to sleep
 */
export async function sleep(ms: number): Promise<void> {
	return new Promise<void>((resolve) => setTimeout(() => resolve(), ms))
}

export async function saveToLocalStorage<T extends JSONdecoded>(key: string, data: T) {
	if (browser && localStorage) {
		localStorage.setItem(key, JSON.stringify(data))
	}
}

export function getFromLocalStorage<T extends JSONdecoded>(key: string, defaultValue: T): T {
	if (browser && localStorage) {
		const data = localStorage.getItem(key)
		return data ? JSON.parse(data) : defaultValue
	}

	return defaultValue
}
