<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
</script>

<div class={`single-column ${cls}`}>
	<slot />
</div>

<style lang="scss">
	.single-column {
		padding: 0 var(--spacing-24);
		width: 100%;
		max-width: 498px;
		margin-inline: auto;
	}
</style>
