<script lang="ts">
	import Card from '$lib/components/grid-card.svelte'
	import { formatDateAndTime } from '$lib/utils/format'
	import type { Post } from '$lib/stores/post'
	import adapter from '$lib/adapters'

	let cls: string | undefined = undefined
	export let noHover: boolean | undefined = undefined
	export { cls as class }

	export let post: Post
</script>

<Card on:click class={` ${cls}`} {noHover}>
	<div class={`content-wrapper`}>
		<div class="imgs">
			{#each post.images as image, index}
				{#if index <= 5}
					<div>
						<img src={adapter.getPicture(image)} alt="post" />
						<!-- TODO: add check and functionality to 'more images' badge -->
						{#if index === 5 && post.images.length > 6}
							<div class="more">+{post.images.length - 6}</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
		<div class="post-content">{post.text}</div>
		<div class="user-info">
			<div class="faded">{formatDateAndTime(post.timestamp)}</div>
		</div>
		<!-- FIXME: not sure this is correct -->
		<div style="display: flex; flex-direction: row;">
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
		flex-wrap: wrap;

		div {
			position: relative;
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

		/* one item */
		div:first-child:nth-last-child(1) {
			width: 100%;
		}

		/* two items */
		div:first-child:nth-last-child(2),
		div:first-child:nth-last-child(2) ~ div {
			width: calc(calc(100% - var(--spacing-6)) / 2);
		}

		/* three items */
		div:first-child:nth-last-child(3),
		div:first-child:nth-last-child(3) ~ div,
		div:first-child:not(:nth-last-child(1)):not(:nth-last-child(2)),
		div:nth-child(2):not(:last-child),
		div:nth-child(3),
		div:nth-child(4),
		div:nth-child(5),
		div:nth-child(6) {
			width: calc(calc(100% - var(--spacing-12)) / 3);
		}
		.more {
			position: absolute;
			background-color: rgba(var(--color-black-rgb), 0.5);
			color: var(--color-body-bg);
			border-radius: var(--spacing-24);
			padding: var(--spacing-12);
			min-width: 44px;
			text-align: center;
			inset: 50% 50% auto auto;
			transform: translate(50%, -50%);
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
