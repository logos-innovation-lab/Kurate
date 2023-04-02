<script lang="ts">
	import { onDestroy, onMount, createEventDispatcher } from 'svelte'
	import { browser } from '$app/environment'

	const dispatch = createEventDispatcher()

	let cls: string | undefined = undefined
	export { cls as class }
	export let disabled: boolean | undefined = undefined
	export let rep: boolean | undefined = undefined

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

	// Trigger event when dropdown is opened or closed
	$: showDropdown ? dispatch('open') : dispatch('close')
</script>

<div bind:this={dropdownElement}>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div on:click={() => !disabled && (showDropdown = !showDropdown)}>
		<slot name="button" disabled />
	</div>

	<div class={`root ${cls}`}>
		<ul class={`${showDropdown ? '' : 'hidden'} ${rep ? 'rep' : ''} ${cls}`}>
			<slot />
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

			&.rep {
				inset: calc(100% - var(--spacing-12)) calc(var(--spacing-24) * -1) auto auto;
			}

			@media (min-width: 450px) {
				min-width: min(calc(100vw - 48px), 350px);
			}

			&.hidden {
				display: none;
			}
		}
	}
</style>
