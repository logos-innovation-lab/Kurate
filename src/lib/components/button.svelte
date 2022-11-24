<script lang="ts">
	import WalletIcon from '$lib/components/icons/wallet.svelte'
	import type { SvelteComponent } from 'svelte'

	export let variant: 'light' | 'dark' = 'light'
	export let icon: ConstructorOfATypedSvelteComponent | undefined = undefined

	let hovered = false
</script>

<button class={`${variant} root`} on:mouseenter={() => hovered = true} on:mouseleave={() => hovered = false}>
	{#if icon !== undefined}
		<svelte:component this={icon} size='20' fill={hovered ? 'black' : 'white'} />
	{/if}
	<slot />
</button>

<style>
	.root {
		padding: 15px;
		border: 1px solid var(--color-black);
		border-radius: 50px;
		cursor: pointer;
		transition: 1s;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.light,
	.dark:hover {
		color: var(--color-black);
		background-color: var(--color-white);
		border-color: var(--color-light-grey);
	}

	.dark,
	.light:hover {
		color: var(--color-white);
		background-color: var(--color-black);
		border-color: var(--color-light-black);
	}
</style>
