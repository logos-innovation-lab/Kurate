<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
</script>

<div class={`info ${cls}`}>
	<slot />
</div>

<style lang="scss">
	.info {
		text-align: center;
		padding-block: var(--spacing-24);
		transition: padding 0.2s;

		:global(p) {
			margin-bottom: var(--spacing-6);
		}

		:global(.h2) {
			margin-bottom: var(--spacing-12);
		}

		@media (min-width: 688px) {
			padding-block: var(--spacing-48);
			transition: padding 0.2s;
		}
	}
</style>
