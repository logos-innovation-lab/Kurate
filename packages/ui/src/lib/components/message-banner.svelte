<script lang="ts">
	import type { ComponentConstructor, IconProps } from '$lib/types'
	export let style: 'info' | 'danger' = 'info'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
</script>

<div class={`info-banner ${style}`}>
	<svelte:component this={icon} />
	<slot />
</div>

<style lang="scss">
	.info-banner {
		position: sticky;
		inset: 0 0 auto;
		z-index: 100;
		padding: var(--spacing-12);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: row;
		gap: var(--spacing-6);
		font-size: 14px;
		font-weight: var(--font-weight-sb);

		&.info {
			color: (--color-body-text);
			background-color: var(--grey-200);
		}

		&.danger {
			background-color: rgba(var(--color-red-rgb), 0.05);
			color: var(--color-red);

			:global(svg) {
				fill: var(--color-red);
			}
		}
	}
</style>
