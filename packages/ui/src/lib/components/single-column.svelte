<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
</script>

<div class={`root ${cls}`}>
	<slot />
</div>

<style lang="scss">
	.root {
		padding: 0 var(--spacing-24);
		max-width: 498px;
		margin-inline: auto;
	}
</style>
