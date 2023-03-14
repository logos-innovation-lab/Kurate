<script lang="ts">
	export let visible: 'always' | 'desktop' | 'mobile' = 'always'
</script>

<hr class={visible} />

<style lang="scss">
	hr {
		border: none;
		width: 100%;
		height: 1px;
		background-color: var(--grey-200);

		&.desktop {
			@media (max-width: 687.98px) {
				display: none;
			}
		}
		&.mobile {
			@media (min-width: 688px) {
				display: none;
			}
		}

		// @media (prefers-color-scheme: dark) {
		// 	background-color: var(--grey-500);
		// }
	}
</style>
