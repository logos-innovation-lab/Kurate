<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }

	let filterText = ''
</script>

<div class={`root header-description ${cls}`}>
	<div class="subtitle">All personas</div>
	<input bind:value={filterText} placeholder="Search" />
</div>

<style lang="scss">
	.root {
		padding: var(--spacing-12);
		transition: padding 0.2s, margin 0.2s;

		@media (min-width: 1280px) {
			padding-bottom: var(--spacing-12);
			margin: 0;
			transition: padding 0.2s, margin 0.2s;
		}

		@media (prefers-color-scheme: dark) {
			&.scrolled {
				box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			}
		}
	}

	.subtitle {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		font-size: 16px;
		font-weight: 600;

		@media (min-width: 1280px) {
			padding: 0;
			width: 1280px;
			margin: 0 auto 0;
		}
	}
</style>
