<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
	export let name: string
	export let description: string
	export let postsCount: number
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={`root ${cls}`} on:click>
	<div class="picture" />
	<div class="details">
		<div class="header">{name}</div>
		<div class="description">{description}</div>
		<div class="postsCount">{postsCount}</div>
	</div>
</div>

<style lang="scss">
	.root {
		display: flex;
		flex-direction: row;
		padding: 10px;
		border: 1px solid grey;
		cursor: pointer;
	}

	.picture {
		width: 100px;
		height: 100px;
	}

	.details {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
</style>
