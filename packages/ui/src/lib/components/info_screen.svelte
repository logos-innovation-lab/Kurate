<script lang="ts">
	// import Undo from '$lib/components/icons/undo.svelte'
	// import Button from '$lib/components/button.svelte'
	import Header from '$lib/components/header.svelte'

	// let y: number

	export let title: string
	export let undo: boolean | undefined = undefined

	export let onBack: () => unknown = () => history.back()
</script>

<!-- <svelte:window bind:scrollY={y} /> -->

<!-- <header class={y > 0 ? 'scrolled' : ''}>
	<div class="header-content">
		<div class="btn-undo">
			<Button icon={Undo} on:click={onBack} />
		</div>
		<h1>{title}</h1>
	</div>
</header> -->

<Header {title} {undo} on:click={onBack}>
	<svelte:fragment slot="btn-left">
		<slot name="btn-left" />
	</svelte:fragment>
</Header>

<div class="content">
	<slot />

	<div class="btns">
		<slot name="buttons" />
	</div>
</div>

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

	.content {
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
			// padding-top: var(--spacing-48);
		}
	}
</style>
