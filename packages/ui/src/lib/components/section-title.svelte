<script lang="ts">
	export let title: string
	import Divider from '$lib/components/divider.svelte'
	export let noDivider: boolean | undefined = undefined
	export let noPad: boolean | undefined = undefined
</script>

<div class="root">
	{#if !noDivider}
		<Divider visible="desktop" />
	{/if}
	<div class={`wrapper ${noPad ? '' : 'pad'}`}>
		<div class="row">
			<div class="title">{title}</div>
			<div class="buttons">
				<slot name="buttons" />
			</div>
		</div>

		<slot />
	</div>
	<Divider visible="mobile" />
</div>

<style lang="scss">
	.wrapper {
		padding-block: var(--spacing-24);
		transition: padding 0.2s;
		max-width: 498px;
		margin-inline: auto;

		&.pad {
			padding-inline: var(--spacing-24);
		}

		@media (min-width: 688px) {
			max-width: 996px;
			padding-bottom: var(--spacing-12);

			&.pad {
				padding-inline: var(--spacing-48);
			}
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

		.row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: row;
			flex-wrap: wrap;
			margin-bottom: var(--spacing-12);
			gap: var(--spacing-12);

			.title {
				font-size: var(--font-size-lg);
				font-weight: var(--font-weight-sb);
				transition: padding 0.2s;
				max-width: 498px;
				border-bottom: none;
			}

			@media (min-width: 688px) {
				margin-bottom: var(--spacing-24);
			}

			.buttons {
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
