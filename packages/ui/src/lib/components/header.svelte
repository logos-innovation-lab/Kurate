<script lang="ts">
	import Button from './button.svelte'
	import Undo from '$lib/components/icons/undo.svelte'

	let cls: string | undefined = undefined
	export { cls as class }

	let y: number
	
	export let onBack: () => unknown = () => history.back()
	export let title = ''
	export let undo: boolean | undefined = undefined
</script>

<svelte:window bind:scrollY={y} />
			
<header class={`root ${y > 0 ? 'scrolled' : ''} ${cls}`}>
	<div class="content container-full">
		<div>
			{#if undo === true}
				<Button icon={Undo} variant="secondary" on:click={onBack} />
			{:else}
				<slot name="btn-left" />
			{/if}
		</div>

		<h1 class={`title ${cls}`}>
			{title}
		</h1>

		<div class="btns">
			<slot name="btns" />
		</div>
	</div>
</header>

<style lang="scss">
	header.root {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(var(--blur));
		transition: box-shadow 0.2s;
		z-index: 100;
		margin-inline: -10px;
		padding-inline: 22px;
		padding-block: var(--spacing-24);

		@media (min-width: 688px) {
			padding-block: var(--spacing-48);
			transition: padding 0.2s;
		}

		.content {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: var(--spacing-12);
			// margin-inline: 10px;
			// padding-inline: var(--spacing-24);
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

			// *:empty {
			// 	flex-basis: 0;
			// }

			.btns:not(:empty) {
				display: flex;
				justify-content: flex-end;
				align-items: center;
				flex-direction: row;
				gap: var(--spacing-12);
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
			text-align: center;
		}

		&.scrolled {
			// box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);
			box-shadow: 0 6px 6px -6px rgba(var(--color-body-text-rgb), 0.25);
			padding-block: var(--spacing-12);
			transition: box-shadow 0.2s;

			// .content {
			// 	@media (min-width: 688px) {
			// 		padding: var(--spacing-12);					
			// 		transition: padding 0.2s;
			// 	}
			// }
			@media (prefers-color-scheme: dark) {
				box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			}
		}
	}
</style>
