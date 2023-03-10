<script lang="ts">
	import { profile } from '$lib/stores/profile'

	export let title: string
</script>

<div class="root">
	{#if $profile.signer === undefined}
		<hr />
	{/if}
	<div class="filter-wrap">
		<div class="filter">
			<div class="filter-title">{title}</div>
			<div class="filter-btns">
				<slot name="buttons" />
			</div>
		</div>

		<slot />
	</div>
	<hr />
</div>

<style lang="scss">
	hr {
		@media (min-width: 688px) {
			display: none;
		}
	}

	.filter-wrap {
		padding: var(--spacing-24);
		transition: padding 0.2s;
		max-width: 498px;
		margin-inline: auto;

		@media (min-width: 688px) {
			max-width: 996px;
			padding-inline: var(--spacing-48);
			padding-bottom: var(--spacing-12);
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

		.filter {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;
			margin-bottom: var(--spacing-12);

			.filter-title {
				font-size: var(--font-size-lg);
				font-weight: var(--font-weight-sb);
				transition: padding 0.2s;
				max-width: 498px;
				border-bottom: none;
			}

			@media (min-width: 688px) {
				margin-bottom: var(--spacing-24);
			}

			.filter-btns {
				display: flex;
				justify-content: space-between;
				align-items: center;
				flex-direction: row;
				flex-wrap: nowrap;
				gap: var(--spacing-12);
			}
		}
	}
</style>
