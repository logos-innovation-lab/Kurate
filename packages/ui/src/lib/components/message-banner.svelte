<script lang="ts">
	import type { ComponentConstructor, IconProps } from '$lib/types'
	export let icon: ComponentConstructor<IconProps> | undefined = undefined
</script>

<div class="info-banner">
	<svelte:component this={icon} />
	<slot />
</div>

<style lang="scss">
	.info-banner {
		position: sticky;
		inset: 0 0 auto;
		z-index: 100;
		background-color: var(--grey-200);
		padding: var(--spacing-12);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: row;
		gap: var(--spacing-6);
		font-size: 14px;
	}
</style>
