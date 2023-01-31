<script lang="ts">
	import Button from './button.svelte'

	let cls: string | undefined = undefined
	export { cls as class }
</script>

<div class={`root ${cls}`}>
	<Button variant="secondary" label="OK" />
</div>

<style lang="scss">
	.root {
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		padding-left: var(--spacing-12);
		padding-right: var(--spacing-12);
		background-color: #0005;
		z-index: 300;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
