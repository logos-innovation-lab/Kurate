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

export interface DropdownOption {
	text: string
	danger?: boolean
	active?: boolean
	disabled?: boolean
	action: () => unknown
}
