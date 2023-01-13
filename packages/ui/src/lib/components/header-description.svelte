<script lang="ts">


	let cls: string | undefined = undefined
	export { cls as class }

</script>


<div class={`root ${cls}`}>
	<div class="header-description">
		Milestone 1 shaman pitchfork typewriter single-origin coffee beard flannel, actually
		chillwave.
	</div>
	<div class="subtitle">Public timeline</div>
</div>

<style lang="scss">
	.root {
		max-width: 1280px;
		margin: 0 auto 0;
		padding: var(--spacing-12);
		border-bottom: 1px solid var(--grey-200);

		@media (min-width: 1280px) {
			padding: 0;
			padding-bottom: var(--spacing-12);
			border-bottom: 1px solid var(--grey-200);
			transition: padding 0.2s;
		}

		@media (prefers-color-scheme: dark) {
			border-bottom-color: var(--grey-500);
			&.scrolled {
				box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			}
		}
	}

	.header-description {
		padding: 0 0 var(--spacing-24);
		opacity: 1;
	}

	.subtitle {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		font-size: 16px;
		font-weight: 600;
		padding: 0;
		overflow: hidden;
		opacity: 1;
	}
</style>
