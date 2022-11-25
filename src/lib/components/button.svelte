<script lang="ts">
	import type { ComponentConstructor, IconProps } from '$lib/types'

	export let variant: 'light' | 'dark' = 'light'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
	export let click: svelte.JSX.MouseEventHandler<HTMLButtonElement> | null | undefined = undefined
	export let label: string | undefined = undefined
</script>

<button class={`root ${variant} ${!label ? 'icon-only' : ''}`} on:click={click}>
	{#if icon !== undefined}
		<div class="wrapper">
			<svelte:component
				this={icon}
				fill={variant === 'light' ? 'var(--color-primary)' : 'var(--color-secondary)'}
			/>
		</div>
	{/if}
	{#if label !== undefined}
		{label}
	{/if}
</button>

<style>
	.root {
		padding-left: var(--spacing-15);
		padding-right: var(--spacing-15);
		height: 44px;
		border: 1px solid var(--color-primary);
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
		margin-right: var(--spacing-6);
	}
	.icon-only .wrapper {
		margin-right: 0px;
	}
	.light {
		color: var(--color-primary);
		background-color: var(--color-secondary);
		border-color: var(--color-spacer);
	}
	.dark {
		color: var(--color-secondary);
		background-color: var(--color-primary);
		border-color: var(--color-primary);
	}
</style>
