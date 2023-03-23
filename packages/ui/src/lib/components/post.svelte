<script lang="ts">
	import Card from '$lib/components/grid-card.svelte'
	import { formatDateAndTime } from '$lib/utils/format'
	import type { Post } from '$lib/stores/post'
	import adapter from '$lib/adapters'

	let cls: string | undefined = undefined
	export { cls as class }

	export let post: Post
</script>

<Card on:click class={` ${cls}`}>
	<div class={`content-wrapper`}>
		<div class="imgs">
			{#each post.images as image}
				<div>
					<img src={adapter.getPicture(image)} alt="post" />
				</div>
			{/each}
		</div>
		<div class="post-content">{post.text}</div>
		<div class="user-info">
			<div class="faded">{formatDateAndTime(post.timestamp)}</div>
		</div>
		<!-- FIXME: not sure this is correct -->
		<div style='display: flex; flex-direction: row;'>
			<slot />
		</div>
	</div>
</Card>

<style lang="scss">
	.imgs {
		display: flex;
		flex-direction: row;
		gap: var(--spacing-6);
		justify-content: flex-start;
		align-items: center;
		flex-wrap: nowrap;

		div {
			flex-basis: 100%;
			img {
				max-height: 300px;
			}
			&:not(:only-child) img {
				aspect-ratio: 1;
				object-fit: cover;
				width: 100%;
				height: 100%;
			}
		}
	}

	.user-info {
		display: flex;
		flex-direction: row;
		gap: var(--spacing-6);
		margin-bottom: var(--spacing-3);
		font-size: var(--font-size-sm);
	}

	.content-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.post-content {
		font-family: var(--font-serif);
		line-height: 1.38;
	}

	:global(.detail) {
		.post-content {
			font-size: var(--font-size-lg);
		}
	}
</style>
