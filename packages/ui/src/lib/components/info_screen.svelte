<script lang="ts">
	import Header from '$lib/components/header.svelte'

	let cls: string | undefined = undefined
	let y: number
	export { cls as class }
	export let title: string
	export let onBack: () => unknown = () => history.back()
</script>

<svelte:window bind:scrollY={y} />

<Header {title} {onBack} />

<div class={`content ${y > 0 ? 'scrolled' : ''} ${cls}`}>
	<slot />

	<div class="btns">
		<slot name="buttons" />
	</div>
</div>

<style lang="scss">
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
		}

		@media (min-width: 688px) {
			min-height: calc(100vh - 140px);
		}
		&.scrolled {
			min-height: calc(100vh - 68px);
		}
	}
</style>
