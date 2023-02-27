<script lang="ts">
	import Undo from '$lib/components/icons/undo.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Button from '$lib/components/button.svelte'
	import Textarea from '$lib/components/textarea.svelte'
	import Header from '$lib/components/header.svelte'
	import Checkmark from './icons/checkmark.svelte'

	let y: number

	export let name = ''
	export let pitch = ''
	export let description = ''
	export let title: string
	export let onCancel: () => unknown
	export let onSubmit: () => unknown
	export let onBack: undefined | (() => unknown) = undefined
</script>

<svelte:window bind:scrollY={y} />

<Header {title} {onBack} />

<form>
	<Textarea placeholder="Enter a short memorable name…" label="Persona name" bind:value={name} />
	<Textarea
		placeholder="Pitch the persona in one sentence, this should serve as a brief introduction…"
		label="Persona pitch"
		bind:value={pitch}
	/>
	<Textarea
		placeholder="Describe the persona in more details, provide additional context and help anyone understand the concept of this persona…"
		label="Persona description"
		bind:value={description}
	/>

	<div class="btns">
		<Button
			label="Proceed"
			icon={Checkmark}
			variant="primary"
			disabled={!name || !pitch || !description}
			on:click={onSubmit}
		/>

		<Button label="Cancel" icon={Close} on:click={onCancel} />
	</div>
</form>

<style lang="scss">
	// header {
	// 	position: sticky;
	// 	top: 0;
	// 	left: 0;
	// 	right: 0;
	// 	background-color: rgba(var(--color-body-bg-rgb), 0.93);
	// 	backdrop-filter: blur(3px);
	// 	z-index: 100;
	// 	padding: var(--spacing-24);
	// 	transition: padding 0.2s, box-shadow 0.2s;

	// 	@media (prefers-color-scheme: dark) {
	// 		box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
	// 	}

	// 	@media (min-width: 688px) {
	// 		padding: var(--spacing-48);
	// 		transition: padding 0.2s;
	// 	}

	// 	.header-content {
	// 		position: relative;
	// 		max-width: 450px;
	// 		margin-inline: auto;
	// 		display: flex;
	// 		align-items: center;
	// 		justify-content: center;
	// 		transition: max-width 0.2s;

	// 		@media (min-width: 688px) {
	// 			max-width: 996px;
	// 			transition: max-width 0.2s;
	// 		}

	// 		@media (min-width: 1242px) {
	// 			max-width: 1494px;
	// 		}

	// 		@media (min-width: 1640px) {
	// 			max-width: 1992px;
	// 		}

	// 		@media (min-width: 2038px) {
	// 			max-width: 2490px;
	// 		}
	// 	}

	// 	.btn-undo {
	// 		position: absolute;
	// 		inset: 0 0 auto 0;
	// 	}

	// 	h1 {
	// 		font-family: var(--font-body);
	// 		font-weight: 600;
	// 		font-size: 18px;
	// 		font-style: normal;
	// 		text-align: center;
	// 		line-height: 44px;
	// 	}

	// 	&.scrolled {
	// 		box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);
	// 		transition: box-shadow 0.2s;

	// 		@media (min-width: 688px) {
	// 			padding-block: var(--spacing-24);
	// 			transition: padding 0.2s;
	// 		}
	// 	}
	// }

	form {
		min-height: calc(100dvh - 92px);
		min-height: calc(100vh - 92px);
		display: flex;
		align-items: stretch;
		justify-content: center;
		flex-direction: column;
		gap: var(--spacing-48);
		max-width: 498px;
		margin-inline: auto;
		padding: var(--spacing-24);

		.btns {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-12);
			padding-top: var(--spacing-48);
		}
	}
</style>
