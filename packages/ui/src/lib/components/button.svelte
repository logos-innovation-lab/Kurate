<script lang="ts">
	import type { ComponentConstructor, IconProps } from '$lib/types'

	let cls: string | undefined = undefined
	export { cls as class }
	export let variant: 'secondary' | 'primary' | 'overlay' = 'secondary'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
	export let label: string | undefined = undefined
	export let disabled: boolean | undefined = undefined
</script>

<button
	type="button"
	{disabled}
	class={`root ${variant} ${!label ? 'icon-only' : ''} ${cls}`}
	on:click
>
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
		padding-left: var(--spacing-12);
		padding-right: var(--spacing-12);
		height: 44px;
		border-width: 1px;
		border-style: solid;
		box-sizing: border-box;
		border-radius: 50px;
		cursor: pointer;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		font-family: var(--font-body);
		font-weight: 600;
		font-size: var(--font-size-normal);
		transition: border-color 0.2s, background-color 0.2s, color 0.2s;

		&:disabled {
			cursor: not-allowed;
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
		color: var(--color-body-bg);
		border-color: var(--color-body-text);
		background-color: var(--color-body-text);

		& :global(svg) {
			fill: var(--color-body-bg);
		}

		&:disabled {
			background-color: var(--grey-200);
			border-color: var(--grey-200);
			color: var(--color-body-bg);
		}

		&:active:not(:disabled),
		&:hover:not(:disabled) {
			border-color: var(--color-black);
			background-color: var(--color-black);
			transition: border-color 0.2s, background-color 0.2s;
		}

		@media (prefers-color-scheme: dark) {
			&:disabled {
				background-color: var(--grey-200);
				color: var(--color-body-bg);

				& :global(svg) {
					fill: var(--color-body-bg);
				}
			}

			&:active:not(:disabled),
			&:hover:not(:disabled) {
				transition: border-color 0.2s, background-color 0.2s;
			}
		}
	}
	.secondary {
		background-color: var(--color-body-bg);
		border-color: var(--grey-200);
		color: var(--color-body-text);

		& :global(svg) {
			fill: var(--color-body-text);
		}

		&:disabled {
			color: var(--grey-200);

			& :global(svg) {
				fill: var(--grey-200);
			}
		}

		&:active:not(:disabled),
		&:hover:not(:disabled) {
			background-color: var(--grey-150);
			transition: border-color 0.2s, background-color 0.2s;
		}

		@media (prefers-color-scheme: dark) {
			background-color: var(--color-body-bg);
			border-color: var(--color-body-text);
			color: var(--color-body-text);

			& :global(svg) {
				fill: var(--color-body-text);
			}

			&:disabled {
				background-color: var(--color-body-bg);
				color: var(--grey-500);

				& :global(svg) {
					fill: var(--grey-500);
				}
			}

			&:active:not(:disabled),
			&:hover:not(:disabled) {
				transition: border-color 0.2s, background-color 0.2s;
			}
		}
	}
	.overlay {
		background-color: rgba(var(--color-black-rgb), 0.5);
		border-color: transparent;
		backdrop-filter: blur(var(--blur));
		color: var(--color-body-bg);

		& :global(svg) {
			fill: var(--color-body-bg);
		}
		&:disabled {
			color: var(--grey-300);

			& :global(svg) {
				fill: var(--grey-300);
			}
		}

		&:active:not(:disabled),
		&:hover:not(:disabled) {
			background-color: var(--color-black-rgb);
			transition: background-color 0.2s;
		}
	}
</style>
