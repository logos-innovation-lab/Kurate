<script lang="ts">
	import { onDestroy, onMount, createEventDispatcher } from 'svelte'
	import { browser } from '$app/environment'
	import type { ComponentConstructor, DropdownOption, IconProps } from '$lib/types'
	import Button from './button.svelte'

	const dispatch = createEventDispatcher()

	let cls: string | undefined = undefined
	export { cls as class }
	export let variant: 'secondary' | 'primary' | 'overlay' = 'secondary'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
	export let label: string | undefined = undefined
	export let disabled: boolean | undefined = undefined
	export let options: DropdownOption[]

	let showDropdown = false
	let dropdownElement: HTMLElement

	const closeDropdown = (ev: MouseEvent) => {
		const target = ev.target as unknown as Node
		if (dropdownElement.contains(target)) {
			// Clicked on the dropdown button or inside the dropdown
		} else {
			// Clicked outside the dropdown
			showDropdown = false
		}
	}

	onMount(() => {
		if (browser && window) window.addEventListener('click', closeDropdown)
	})

	onDestroy(() => {
		if (browser && window) window.removeEventListener('click', closeDropdown)
	})
	$: if (showDropdown) dispatch('open')
	$: if (!showDropdown) dispatch('close')
</script>

<div bind:this={dropdownElement}>
	<Button on:click={() => (showDropdown = !showDropdown)} {label} {icon} {variant} {disabled} />

	<div class={`root ${cls}`}>
		<ul class={showDropdown ? '' : 'hidden'}>
			{#each options as option}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<li class={option.danger ? 'danger' : ''} on:click={option.action}>{option.text}</li>
			{/each}
		</ul>
	</div>
</div>

<style lang="scss">
	.root {
		position: relative;

		ul {
			position: absolute;
			inset: 100% 0 auto auto;
			min-width: min(calc(100vw - 48px), 250px);
			max-width: max(calc(100vw - 48px), 450px);
			z-index: 10;
			border-radius: 22px;
			backdrop-filter: blur(3px);
			box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.25);
			background-color: rgba(255, 255, 255, 0.93);

			&.hidden {
				display: none;
			}

			li {
				padding: var(--spacing-12);
				list-style: none;
				cursor: pointer;

				&.danger {
					color: red; // FIXME: wrong color, I'm sure
				}

				&:hover {
					background-color: green; // FIXME: wrong color, I'm sure

					&:first-child {
						border-radius: 22px 22px 0px 0px;
					}

					&:last-child {
						border-radius: 0px 0px 22px 22px;
					}
				}

				&:not(:last-child) {
					border-bottom: 1px solid var(--grey-200);

					@media (prefers-color-scheme: dark) {
						background-color: var(--grey-500);
					}
				}
			}
		}
	}
</style>
