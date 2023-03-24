import type { SvelteComponentTyped } from 'svelte'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentConstructor<T extends Record<string, any>> = new (args: {
	target: Element | ShadowRoot
	props?: T
}) => SvelteComponentTyped<T>

export interface IconProps {
	size?: number
	class?: string
}

export type ReputationOptions = 5 | 25 | 100 | 250 | 500
