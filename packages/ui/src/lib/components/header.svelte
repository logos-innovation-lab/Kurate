<script lang="ts">
	import Button from './button.svelte'
	import Undo from '$lib/components/icons/undo.svelte'

	let cls: string | undefined = undefined
	export { cls as class }

	let y: number

	export let onBack: (() => unknown) | undefined = undefined
	export let title = ''
</script>

<svelte:window bind:scrollY={y} />

<header class={`root ${y > 0 ? 'scrolled' : ''} ${cls}`}>
	<div class="content">
		<div>
			{#if typeof onBack === 'function'}
				<Button icon={Undo} on:click={onBack} />
			{/if}
		</div>

		<h1 class={`title ${cls}`}>
			{title}
		</h1>

		<div class="btns">
			<slot />
		</div>
	</div>
</header>

<style lang="scss">
	header.root {
		position: sticky;
		inset: 0 -10px auto;
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(var(--blur));
		z-index: 100;
		padding-inline: var(--spacing-24);
		padding-block: var(--spacing-24);
		transition: box-shadow 0.2s, padding 0.2s;

		@media (min-width: 688px) {
			padding-block: var(--spacing-48);
			padding-inline: var(--spacing-48);
			transition: padding 0.2s;
		}

		.content {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: var(--spacing-12);

			> * {
				flex-basis: 65%;
				&.title:not(:empty) {
					flex-basis: 100%;
					text-align: center;
				}
				&:last-child {
					display: flex;
					justify-content: flex-end;
				}
			}

			.btns:not(:empty) {
				display: flex;
				justify-content: flex-end;
				align-items: center;
				flex-direction: row;
				gap: var(--spacing-12);
			}
		}

		.title {
			font-family: var(--font-body);
			font-weight: 600;
			font-size: 18px;
			font-style: normal;
			text-align: center;
		}

		&.scrolled {
			box-shadow: 0 6px 6px -6px rgba(var(--color-body-text-rgb), 0.25);
			padding-block: var(--spacing-12);
			padding-inline: 12px;
			transition: box-shadow 0.2s, padding 0.2s;

			// @media (prefers-color-scheme: dark) {
			// 	box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			// }
		}
	}
</style>
