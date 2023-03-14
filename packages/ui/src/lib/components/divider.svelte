<script lang="ts">
	export let HideOnDesktop: boolean | undefined = undefined
</script>

<hr class={HideOnDesktop ? 'hide-on-desktop' : ''} />

<style lang="scss">
	hr {
		border: none;
		width: 100%;
		height: 1px;
		background-color: var(--grey-200);

		&.hide-on-desktop {
			@media (min-width: 688px) {
				display: none;
			}
		}

		// @media (prefers-color-scheme: dark) {
		// 	background-color: var(--grey-500);
		// }
	}
</style>
