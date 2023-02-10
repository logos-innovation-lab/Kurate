<script lang="ts">
</script>

<div class="root">
	<slot />
</div>

<style lang="scss">
	.root {
		border-radius: 22px;
		backdrop-filter: blur(3px);
		box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.25);
		background-color: rgba(255, 255, 255, 0.93);

		:global(li) {
			padding: var(--spacing-12);
			list-style: none;

			&:not(:last-child) {
				border-bottom: 1px solid var(--grey-200);

				@media (prefers-color-scheme: dark) {
					background-color: var(--grey-500);
				}
			}
		}
	}
</style>
