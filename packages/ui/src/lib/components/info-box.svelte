<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
</script>

<div class={`info ${cls}`}>
	<div class="content">
		<slot />
	</div>
	{#if $$slots.buttons}
		<div class="buttons">
			<slot name="buttons" />
		</div>
	{/if}
</div>

<style lang="scss">
	.info {
		padding-block: var(--spacing-24);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: var(--spacing-48);

		@media (min-width: 688px) {
			padding-block: var(--spacing-48);
		}
		.content {
			text-align: center;
			display: flex;
			flex-direction: column;
			gap: var(--spacing-6);

			:global(.icon) {
				margin-bottom: var(--spacing-6);
			}
		}
		.buttons:not(:empty) {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-12);
		}
	}
</style>
