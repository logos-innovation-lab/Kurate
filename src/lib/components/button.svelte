<script lang="ts">
	import type { ComponentConstructor, IconProps } from '$lib/types'

	export let variant: 'light' | 'dark' = 'light'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
	export let click: svelte.JSX.MouseEventHandler<HTMLButtonElement> | null | undefined = undefined
	export let label: string | undefined = undefined

	let hovered = false
	$: fill = (variant === 'dark' && hovered) || (variant === 'light' && !hovered) ? 'black' : 'white'
</script>

<button
	class={`root ${variant} ${!label ? 'icon-only' : ''}`}
	on:mouseenter={() => (hovered = true)}
	on:click={click}
	on:mouseleave={() => (hovered = false)}
>
	{#if icon !== undefined}
		<div class="wrapper">
			<svelte:component this={icon} size={20} {fill} />
		</div>
	{/if}
	{#if label !== undefined}
		{label}
	{/if}
</button>

<style>
	.root {
		padding-left: 15px;
		padding-right: 15px;
		height: 44px;
		border: 1px solid var(--color-black);
		border-radius: 50px;
		cursor: pointer;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 16px;
	}
	.icon-only {
		width: 44px;
	}
	.wrapper {
		width: 20px;
		height: 20px;
		margin-right: 10px;
	}
	.icon-only .wrapper {
		margin-right: 0px;
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
		border-color: var(--color-black);
	}
</style>
