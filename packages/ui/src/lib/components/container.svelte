<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
</script>

<div class={`container ${cls}`}>
	<slot />
</div>

<style lang="scss">
	.container {
		padding: 0 var(--spacing-24);
		transition: padding 0.2s;
		max-width: 498px;
		margin-inline: auto;

		@media (min-width: 688px) {
			padding: 0 var(--spacing-48);
			max-width: 996px;
		}

		@media (min-width: 1242px) {
			max-width: 1494px;
		}

		@media (min-width: 1640px) {
			max-width: 1992px;
		}

		@media (min-width: 2038px) {
			max-width: 2490px;
		}
	}
</style>
