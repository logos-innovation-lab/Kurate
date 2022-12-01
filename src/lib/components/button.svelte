<script lang="ts">
	import type { ComponentConstructor, IconProps } from '$lib/types'

	let cls: string | undefined = undefined
	export { cls as class }
	export let variant: 'secondary' | 'primary' = 'secondary'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
	export let label: string | undefined = undefined
</script>

<button class={`root ${variant} ${!label ? 'icon-only' : ''} ${cls}`} on:click>
	{#if icon !== undefined}
		<div class="wrapper">
			<svelte:component this={icon} />
		</div>
	{/if}
	{#if label !== undefined}
		{label}
	{/if}
</button>

<style lang="scss">
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

		.wrapper {
			margin-right: 0px;
		}
	}
	.wrapper {
		width: 20px;
		height: 20px;
		margin-right: var(--spacing-6);
	}
	.primary {
		background-color: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-secondary);

		& :global(svg) {
			fill: var(--color-secondary);
		}
	}
	.secondary {
		background-color: var(--color-secondary);
		border-color: var(--color-grey-border);
		color: var(--color-primary);

		& :global(svg) {
			fill: var(--color-primary);
		}
	}
</style>
