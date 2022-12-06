<script lang="ts">
	import type { ComponentConstructor, IconProps } from '$lib/types'

	export let files: FileList | undefined = undefined

	let cls: string | undefined = undefined
	export { cls as class }
	export let variant: 'secondary' | 'primary' = 'secondary'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
	export let label: string | undefined = undefined
	export let disabled: boolean | undefined = undefined
</script>

<label class={`root ${variant} ${!label ? 'icon-only' : ''} ${disabled ? 'disabled' : ''} ${cls}`}>
	{#if icon !== undefined}
		<div class="wrapper">
			<svelte:component this={icon} />
		</div>
	{/if}
	{#if label !== undefined}
		{label}
	{/if}
	<input type="file" bind:files {disabled} />
</label>

<style lang="scss">
	.root {
		input {
			display: none;
		}

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

		&.disabled {
			cursor: not-allowed;
			opacity: 0.15;
		}
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
