<script lang="ts">
</script>

<div class="grid">
	<slot />
</div>

<style lang="scss">
	.grid {
		display: grid;
		grid-auto-columns: auto;
		grid-template-columns: 100%;
		grid-auto-rows: auto;
		align-items: end;
		margin-inline: auto;

		@media (min-width: 688px) {
			padding: 0 var(--spacing-24);
			transition: padding 0.2s;
			max-width: 996px;
			grid-template-columns: repeat(2, 1fr);
		}

		@media (min-width: 1242px) {
			max-width: 1494px;
			grid-template-columns: repeat(3, 1fr);
		}

		@media (min-width: 1640px) {
			max-width: 1992px;
			grid-template-columns: repeat(4, 1fr);
		}

		@media (min-width: 2038px) {
			max-width: 2490px;
			grid-template-columns: repeat(5, 1fr);
		}
	}
</style>
