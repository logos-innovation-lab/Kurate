<script lang="ts">
	import UserMultiple from './icons/user-multiple.svelte'

	let cls: string | undefined = undefined
	export { cls as class }
	export let name: string
	export let description: string
	export let postsCount: number
	export let picture: string | undefined
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class={`root ${cls}`} on:click>
	<div class="picture"><img src={picture} alt="persona" /></div>
	<div class="details">
		<div class="header">{name}</div>
		<div class="description">{description}</div>
		<div class="post-count"><UserMultiple size={18} /> {postsCount}</div>
	</div>
</div>

<style lang="scss">
	.root {
		display: flex;
		flex-direction: row;
		padding: 24px;
		cursor: pointer;

		&:hover {
			background-color: #f9f9f9;
		}
	}

	.picture {
		width: 100px;
		height: 100px;
		flex-basis: 100px;
		flex-shrink: 0;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.details {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-left: 24px;
	}
	.post-count {
		display: flex;
		flex-direction: row;
	}
</style>
