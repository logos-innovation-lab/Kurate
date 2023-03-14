<script lang="ts">
	import { onDestroy, onMount, createEventDispatcher } from 'svelte'
	import { browser } from '$app/environment'
	import type { ComponentConstructor, DropdownOption, IconProps } from '$lib/types'
	import Button from './button.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'

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
				<!-- TODO: add "active" class to <li> when selected to make checkmark work -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<li
					class={`${option.disabled ? 'disabled' : ''} ${option.danger ? 'danger' : ''}`}
					on:click={option.action}
				>
					{option.text}
					{#if option.active}
						<span class="selected">
							<Checkmark size={16} />
						</span>
					{/if}
				</li>
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
			backdrop-filter: blur(3px);
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);
			background-color: rgba(var(--color-body-bg-rgb), 0.93);
			overflow: hidden;

			@media (min-width: 450px) {
				min-width: min(calc(100vw - 48px), 350px);
			}

			&.hidden {
				display: none;
			}

			li {
				padding: var(--spacing-12);
				list-style: none;
				cursor: pointer;
				position: relative;
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: var(--spacing-24);
				font-family: var(--font-serif);
				font-size: var(--font-size-lg);

				&.danger {
					color: var(--color-red);
				}

				&:hover {
					background-color: var(--grey-150);
				}

				&.disabled {
					color: var(--grey-200);
					cursor: not-allowed;
				}

				&:not(:last-child) {
					border-bottom: 1px solid var(--grey-200);

					// @media (prefers-color-scheme: dark) {
					// 	background-color: var(--grey-500);
					// }
				}

				.selected {
					display: flex;
					align-items: center;
				}
			}
		}
	}
</style>
