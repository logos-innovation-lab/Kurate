<script lang="ts">


	let cls: string | undefined = undefined
	export { cls as class }

</script>


<div class={`root header-description ${cls}`}>
	<!-- <div class="header-description">
		Milestone 1 shaman pitchfork typewriter single-origin coffee beard flannel, actually
		chillwave.
	</div> -->
	<div class="subtitle">Public timeline</div>
</div>

<style lang="scss">
	.root {
		padding: var(--spacing-12);
		transition: padding 0.2s, margin 0.2s;
		// border-bottom: 1px solid var(--grey-200);

		@media (min-width: 1280px) {
			padding-bottom: var(--spacing-12);
			margin: 0;
			// border-bottom: 1px solid var(--grey-200);
			transition: padding 0.2s, margin 0.2s;
		}

		@media (prefers-color-scheme: dark) {
			// border-bottom-color: var(--grey-500);
			&.scrolled {
				box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			}
		}
	}

	// .header-description {
	// 	padding: 0 var(--spacing-12) var(--spacing-24);
	// 	opacity: 1;
	// 	transition: padding 0.2s;

	// 	@media (min-width: 1280px) {
	// 		padding: 0 0 var(--spacing-24);
	// 		transition: padding 0.2s;
	// 	}
	// }

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
