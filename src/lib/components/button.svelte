<script lang="ts">
	import type { ComponentConstructor, IconProps } from '$lib/types'

	let cls: string | undefined = undefined
	export { cls as class }
	export let variant: 'secondary' | 'primary' = 'secondary'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
	export let label: string | undefined = undefined
	export let disabled: boolean | undefined = undefined
</script>

<button {disabled} class={`root ${variant} ${!label ? 'icon-only' : ''} ${cls}`} on:click>
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
		outline: 0px solid var(--color-primary);
		outline-offset: 0;
		border: 1px solid var(--color-primary);
		box-sizing: border-box;
		border-radius: 50px;
		cursor: pointer;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 16px;
		transition: outline 0.1s, border-color 0.1s, outline-offset 0.1s;

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
		background-color: var(--color-primary);
		color: var(--color-secondary);

		& :global(svg) {
			fill: var(--color-secondary);
		}

		&:disabled {
			background-color: var(--color-light-grey-background);
			border-color: var(--color-light-grey-background);
			outline-color: var(--color-light-grey-background);
			color:  var(--color-secondary);
		}

		&:active:not(:disabled),
		&:hover:not(:disabled) {
			outline: 2px solid var(--color-primary);			
			transition: outline 0.1s;
		}

		@media (prefers-color-scheme: dark) {
			background-color: var(--color-secondary);
			border-color: var(--color-secondary);
			outline-color: var(--color-secondary);
			color: var(--color-primary);	

			& :global(svg) {
				fill: var(--color-primary);
			}

			&:disabled {
				background-color: var(--color-dark-grey-text);
				border-color: var(--color-dark-grey-text);
				outline-color: var(--color-primary);
				color:  var(--color-primary);

				& :global(svg) {
					fill: var(--color-primary);
				}
			}

			&:active:not(:disabled),
			&:hover:not(:disabled) {
				outline: 2px solid var(--color-secondary);			
				transition: outline 0.1s;
			}
		}
	}
	.secondary {
		background-color: var(--color-secondary);
		border-color: var(--color-light-grey-background);
		outline-color: var(--color-light-grey-background);
		color: var(--color-primary);

		& :global(svg) {
			fill: var(--color-primary);
		}

		&:disabled {
			// background-color: var(--color-light-grey-background);			
			// outline-color: var(--color-light-grey-background);
			color:  var(--color-light-grey-background);
			
			& :global(svg) {
				fill: var(--color-light-grey-background);
			}
		}

		&:active:not(:disabled),
		&:hover:not(:disabled) {
			outline: 1px solid var(--color-primary);
			outline-offset: 2px;
			transition: outline 0.1s, outline-offset 0.1s;
		}

		@media (prefers-color-scheme: dark) {
			background-color: var(--color-primary);
			border-color: var(--color-primary);
			outline: 1px solid var(--color-dark-grey-border);
			color: var(--color-secondary);	

			& :global(svg) {
				fill: var(--color-secondary);
			}

			&:disabled {
				background-color: var(--color-primary);
				outline-color: var(--color-dark-grey-background);
				border-color: var(--color-primary);
				color:  var(--color-dark-grey-text);

				& :global(svg) {
					fill: var(--color-dark-grey-text);
				}
			}

			&:active:not(:disabled),
			&:hover:not(:disabled) {
				outline-color: var(--color-secondary);	
				outline-offset: 2px;		
				transition: outline 0.2s, outline-offset 0.1s;
			}
		}
	}
</style>
