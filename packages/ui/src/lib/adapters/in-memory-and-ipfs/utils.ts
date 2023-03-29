import { MAX_DIMENSIONS } from '$lib/constants'
import type { Persona } from '$lib/stores/persona'
import type { Post } from '$lib/stores/post'
import { ethers } from 'ethers'
import lipsum from './lipsum'

export function randomText(sentenceCount: number): string {
	const res: string[] = []

	for (let i = 0; i < sentenceCount; i++) {
		res.push(lipsum[Math.floor(Math.random() * lipsum.length)])
	}

	return `${res.join('. ')}.`
}

export function executeWithChance(chance: number): boolean {
	return Math.random() < chance
}

export function randomIntegerBetween(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min) + min)
}

export function randomId(): string {
	const randomUUID = crypto.randomUUID()
	const encoder = new TextEncoder()
	return ethers.utils.sha256(encoder.encode(randomUUID))
}

export function randomPost(): Post {
	const images: string[] = []

	// Only 35% of posts should have a picture
	if (executeWithChance(0.35)) {
		// Only 40% of posts with pictures can have more than 3
		const max = executeWithChance(0.4) ? 20 : 3
		for (let i = 0; i < randomIntegerBetween(1, max); i++) {
			images.push(randomPicture(MAX_DIMENSIONS.POST_IMAGE.width, MAX_DIMENSIONS.POST_IMAGE.height))
		}
	}

	const post: Post = {
		text: randomText(randomIntegerBetween(1, 15)),
		timestamp: Date.now(),
		images,
	}

	return post
}

export function randomPersona(personaId: string | number): Persona {
	const name = randomText(1).split(' ')[0]
	const pitch = randomText(randomIntegerBetween(1, 3))
	const description = randomText(randomIntegerBetween(5, 20))
	const cover = randomPicture(MAX_DIMENSIONS.COVER.width, MAX_DIMENSIONS.COVER.height)
	const picture = randomPicture(MAX_DIMENSIONS.PICTURE.width, MAX_DIMENSIONS.PICTURE.height)

	const persona: Persona = {
		name,
		pitch,
		description,
		participantsCount: randomIntegerBetween(1, 500),
		postsCount: randomIntegerBetween(1, 1000),
		cover,
		picture,
		personaId,
	}

	return persona
}

export function randomPicture(width: number, height: number): string {
	return `/${randomId()}/${width}/${height}`
}
