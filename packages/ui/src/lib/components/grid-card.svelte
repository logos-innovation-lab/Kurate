<script lang="ts">
	import Divider from '$lib/components/divider.svelte'
	let cls: string | undefined = undefined
	export let noHover: boolean | undefined = undefined
	export let noBorder: boolean | undefined = undefined
	export { cls as class }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={`root card-wrapper ${noHover ? '' : 'hover'} ${cls}`} on:click>
	<div class="card">
		<slot />
	</div>
	{#if noBorder === false}
		<Divider visible="mobile" />
	{/if}
</div>

<style lang="scss">
	.root {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: flex-end;

		&.hover:hover {
			background-color: var(--grey-150);
		}
	}
	.card {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		flex-wrap: nowrap;
		gap: var(--spacing-12);
		padding: var(--spacing-24);
		cursor: pointer;
		width: 100%;
		max-width: 498px;
		margin-inline: auto;

		@media (min-width: 1242px) {
			min-width: 350px;
		}
	}

	@keyframes new {
		from {
			background-color: var(--success-highlight);
		}
		to {
			background-color: transparent;
		}
	}

	:global(.new) {
		animation-name: new;
		animation-duration: 2.5s;
		animation-timing-function: ease-out;
	}

	// @media (prefers-color-scheme: dark) {
	// 	.root {
	// 		&:not(:last-child) {
	// 			border-bottom-color: var(--grey-500);
	// 		}

	// 		&:hover {
	// 			background-color: var(--grey-500);
	// 		}
	// 	}

	// 	:global(svg) {
	// 		fill: var(--grey-100);
	// 		width: 16px;
	// 		height: 16px;
	// 	}
	// }
</style>
