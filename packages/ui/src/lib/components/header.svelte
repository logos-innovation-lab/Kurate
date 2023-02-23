<script lang="ts">
	import Button from './button.svelte'
	import Undo from '$lib/components/icons/undo.svelte'

	let cls: string | undefined = undefined
	export { cls as class }

	let y: number
	
	export let onBack: () => unknown = () => history.back()
	export let title = ''
</script>

<svelte:window bind:scrollY={y} />

<header class={`root ${y > 0 ? 'scrolled' : ''} ${cls}`}>
	<div class="content container">
		<div>
			<Button icon={Undo} variant="overlay" on:click={onBack} />
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
	header {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(var(--blur));
		transition: box-shadow 0.2s;
		z-index: 100;
		margin-inline: -10px;

		.content {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: var(--spacing-12);
			margin-inline: 10px;
			// padding: var(--spacing-24);
			// transition: padding 0.2s;
			// max-width: 498px;
			// margin-inline: auto;

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


			// @media (min-width: 688px) {
			// 	padding: var(--spacing-48);
			// 	max-width: 996px;
			// 	transition: padding 0.2s;
			// }

			// @media (min-width: 1242px) {
			// 	max-width: 1494px;
			// }

			// @media (min-width: 1640px) {
			// 	max-width: 1992px;
			// }

			// @media (min-width: 2038px) {
			// 	max-width: 2490px;
			// }
		}

		.title {
			font-family: var(--font-body);
			font-weight: 600;
			font-size: 18px;
			font-style: normal;
			text-align: left;
		}

		&.scrolled {
			// box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);

			box-shadow: 0 6px 6px -6px rgba(var(--color-body-text-rgb), 0.25);
			 
			transition: box-shadow 0.2s;

			.content {
				@media (min-width: 688px) {
					padding-block: var(--spacing-24);
					transition: padding 0.2s;
				}
			}
			@media (prefers-color-scheme: dark) {
				box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			}
		}
	}
</style>
