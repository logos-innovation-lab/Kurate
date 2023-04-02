<script lang="ts">
	import Card from '$lib/components/grid-card.svelte'
	import { formatDateAndTime } from '$lib/utils/format'
	import type { DraftPost, Post } from '$lib/stores/post'
	import adapter from '$lib/adapters'

	let cls: string | undefined = undefined
	export let noHover: boolean | undefined = undefined
	export { cls as class }

	export let post: Post | DraftPost
</script>

<Card on:click class={` ${cls}`} {noHover}>
	<div class={`content-wrapper`}>
		<div class="parent parent--adjusted-width">
			{#each post.images as image, index}
				{#if index <= 2}
					<div class="child">
						<img src={adapter.getPicture(image)} alt="post" />
						{#if index === 2 && post.images.length > 3}
							<div class="more">+{post.images.length - 3}</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
		<div class="post-content">{post.text}</div>
		<div class="user-info">
			<div class="faded">{formatDateAndTime(post.timestamp)}</div>
		</div>
		<div class="btns">
			<slot />
		</div>
	</div>
</Card>

<style lang="scss">
	.btns {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		gap: var(--spacing-12);
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

	/* The magic */
	/* Mixins for defining a grid with min and max columns */
	// Thanks to https://stackoverflow.com/questions/28028297/how-can-i-delete-a-window-history-state

	/* Adjusted columns width */
	@mixin grid-cols-adjusted($min-cols, $max-cols, $cols-min-width, $row-gap: 0px, $col-gap: 0px) {
		--min-cols: #{$min-cols};
		--max-cols: #{$max-cols};
		--cols-min-width: #{$cols-min-width};
		--row-gap: #{$row-gap};
		--col-gap: #{$col-gap};

		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(
				min(
					(100% / var(--min-cols) - var(--col-gap) * (var(--min-cols) - 1) / var(--min-cols)),
					max(
						var(--cols-min-width),
						(100% / var(--max-cols) - var(--col-gap) * (var(--max-cols) - 1) / var(--max-cols))
					)
				),
				1fr
			)
		);
		gap: var(--row-gap) var(--col-gap);
	}

	/* Fixed columns width */
	@mixin grid-cols-fixed($min-cols, $max-cols, $cols-min-width, $row-gap: 0px, $col-gap: 0px) {
		--min-cols: #{$min-cols};
		--max-cols: #{$max-cols};
		--cols-min-width: #{$cols-min-width};
		--row-gap: #{$row-gap};
		--col-gap: #{$col-gap};

		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(
				0,
				min(
					(100% / var(--min-cols) - var(--col-gap) * (var(--min-cols) - 1) / var(--min-cols)),
					max(
						var(--cols-min-width),
						(100% / var(--max-cols) - var(--col-gap) * (var(--max-cols) - 1) / var(--max-cols))
					)
				)
			)
		);
		gap: var(--row-gap) var(--col-gap);
	}

	.parent {
		/* Set styles to see the parent */
		max-width: 450px;

		/* Grid systems */
		$min-cols: 1;
		$max-cols: 3;
		$cols-min-width: 2rem;
		$row-gap: var(--spacing-6);
		$col-gap: var(--spacing-6);
		&--adjusted-width {
			@include grid-cols-adjusted($min-cols, $max-cols, $cols-min-width, $row-gap, $col-gap);
		}
		&--fixed-width {
			@include grid-cols-fixed($min-cols, $max-cols, $cols-min-width, $row-gap, $col-gap);
		}
	}

	.child {
		flex-basis: 100%;
		position: relative;

		img {
			max-height: 300px;
			max-height: 300px;
		}

		&:not(:only-child) img {
			aspect-ratio: 1;
			object-fit: cover;
			width: 100%;
			height: 100%;
		}

		.icon {
			position: absolute;
			right: var(--spacing-12);
			top: var(--spacing-12);
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
