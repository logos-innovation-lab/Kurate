<script lang="ts">
	import Button from './button.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Close from '$lib/components/icons/close.svelte'

	let cls: string | undefined = undefined
	export { cls as class }

	let y: number
	let innerWidth: number
	let clientHeight: number
	let topOffset: number
	let spacerElement: HTMLDivElement
	let padding: number
	const PADDING_MIN = 12
	let PADDING_MAX = 48

	$: PADDING_MAX = innerWidth > 688 ? 48 : 24
	$: topOffset = spacerElement?.getBoundingClientRect().top ?? 0
	$: padding = Math.max(PADDING_MAX - PADDING_MIN - y / 2, 0) + PADDING_MIN

	export let onBack: (() => unknown) | undefined = undefined
	export let onClose: (() => unknown) | undefined = undefined
	export let title = ''
	export let onlyScrolled = false
</script>

<svelte:window bind:scrollY={y} bind:innerWidth />

<header
	class={`root ${onlyScrolled ? 'initially-hidden' : ''} ${y > 0 ? 'scrolled' : ''} ${cls}`}
	style={`margin-top: ${topOffset}px; padding: ${padding}px`}
>
	<div class="content" bind:clientHeight>
		<div>
			{#if typeof onBack === 'function'}
				<Button icon={Undo} on:click={onBack} />
			{/if}
		</div>

		<h1 class={`title ${cls}`}>
			{title}
		</h1>

		<div class="btns">
			{#if typeof onClose === 'function'}
				<Button icon={Close} on:click={onClose} />
			{/if}
			<slot />
		</div>
	</div>
</header>
{#if !onlyScrolled}
	<div
		class="spacer"
		style={`height: ${clientHeight + PADDING_MAX * 2}px;`}
		bind:this={spacerElement}
	/>
{/if}

<style lang="scss">
	header.root {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
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
			line-height: 245%;
		}

		// Hide header when not scrolled
		&.initially-hidden {
			display: none;
		}

		&.scrolled {
			transition: box-shadow 0.2s, padding 0.2s;
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);
			display: initial;

			// @media (prefers-color-scheme: dark) {
			// 	box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			// }
		}
	}
</style>
