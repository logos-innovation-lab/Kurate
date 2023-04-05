<script lang="ts">
	import Card from '$lib/components/grid-card.svelte'
	import { formatDateAndTime } from '$lib/utils/format'
	import type { DraftPost, Post } from '$lib/stores/post'
	import adapter from '$lib/adapters'
	import Button from './button.svelte'
	import Close from './icons/close.svelte'
	import ArrowRight from './icons/arrow-right.svelte'
	import ArrowLeft from './icons/arrow-left.svelte'

	let cls: string | undefined = undefined
	export let noHover: boolean | undefined = undefined
	export { cls as class }

	export let post: Post | DraftPost
	let openedImageIndex: number | undefined = undefined

	const MAX_IMAGES = 3

	$: isLastImage = openedImageIndex === post.images.length - 1
	$: isFirstImage = openedImageIndex === 0

	function nextImage() {
		if (openedImageIndex === undefined) return
		openedImageIndex += isLastImage ? 0 : 1
	}

	function previousImage() {
		if (openedImageIndex === undefined) return
		openedImageIndex -= isFirstImage ? 0 : 1
	}

	function closeImage() {
		openedImageIndex = undefined
	}
</script>

<svelte:window
	on:keydown={({ key }) => {
		if (!openedImageIndex) return

		switch (key) {
			case 'ArrowLeft':
				previousImage()
				break

			case 'ArrowRight':
				nextImage()
				break
			case 'Escape':
				closeImage()
				break
		}
	}}
/>

{#if openedImageIndex !== undefined}
	<!-- Show image in full screen modal -->
	<div class="fullscreen-image">
		<img src={adapter.getPicture(post.images[openedImageIndex])} alt="post" />
	</div>
	<div class="button-close">
		<Button icon={Close} variant="overlay" on:click={closeImage} />
	</div>
	{#if !isLastImage}
		<div class="button-next">
			<Button icon={ArrowRight} variant="overlay" on:click={nextImage} />
		</div>
	{/if}
	{#if !isFirstImage}
		<div class="button-previous">
			<Button icon={ArrowLeft} variant="overlay" on:click={previousImage} />
		</div>
	{/if}
{/if}

<Card on:click class={` ${cls}`} {noHover}>
	<div class={`content-wrapper`}>
		<div class="parent parent--adjusted-width">
			{#each post.images as image, index}
				{#if index < MAX_IMAGES}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						class="child"
						on:click|preventDefault|stopPropagation={() => (openedImageIndex = index)}
					>
						<img src={adapter.getPicture(image)} alt="post" />
						{#if index === MAX_IMAGES - 1 && post.images.length > MAX_IMAGES}
							<div class="more">+{post.images.length - MAX_IMAGES}</div>
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
	.fullscreen-image {
		position: fixed;
		inset: 0;
		z-index: 1000;
		background-color: var(--color-black);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.button-close {
		position: fixed;
		top: var(--spacing-24);
		right: var(--spacing-24);
		z-index: 1005;

		@media (min-width: 668px) {
			top: var(--spacing-48);
			right: var(--spacing-48);
		}
	}
	.button-next {
		position: fixed;
		top: 50%;
		transform: translateY(-50%);
		right: var(--spacing-24);
		z-index: 1005;

		@media (min-width: 668px) {
			right: var(--spacing-48);
		}
	}
	.button-previous {
		position: fixed;
		top: 50%;
		transform: translateY(-50%);
		left: var(--spacing-24);
		z-index: 1005;

		@media (min-width: 668px) {
			left: var(--spacing-48);
		}
	}
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
