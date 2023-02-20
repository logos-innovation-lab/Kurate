<script lang="ts">
	import { formatDateAndTime } from '$lib/utils/format'

	import type { Post } from '$lib/stores/post'

	let cls: string | undefined = undefined
	export { cls as class }
	export let post: Post
</script>

<div class="post-card-wrapper">
	<div class={`root ${cls}`}>
		<div class="content-wrapper">
			<div class="imgs" >

				<!-- I HARD CODED SOME IMAGES TO STYLE THE SECTION AND LEFT THEM TO SHOW THE STRUCTURE IN USE -->
				<!-- MORE THAN 3 IMAGES SHOULD HAVE A "PLUS" ICON OVER THE THIRD WITH COUNT OF EXTRA IMAGES -->

				<!-- <div>
					<img src="https://via.placeholder.com/600x1000"  alt="image"/>
				</div>
				<div>
					<img src="https://via.placeholder.com/400x840"  alt="image"/>
				</div>
				<div>
					<img src="https://via.placeholder.com/800x300"  alt="image"/>
				</div> -->
			</div>
			<div class="post-content">{post.text}</div>
			<div class="user-info">
				<div class="faded">{formatDateAndTime(post.timestamp)}</div>
			</div>
		</div>
	</div>
	<hr />	
</div>

<style lang="scss">
	.post-card-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-end;

		hr {
			@media (min-width: 688px) {
				display: none;
			}
		}
	}

	.root {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
		flex-wrap: nowrap;
		gap: var(--spacing-12);
		padding: var(--spacing-24);
		cursor: pointer;
		width: 100%;
		max-width: 498px;
		margin-inline: auto;

		@media (min-width: 1242px) {
			min-width: 350px;
		}

		&:hover {
			background-color: var(--grey-150);
		}

		@media (prefers-color-scheme: dark) {
		}
	}

	.imgs {
		display: flex;
		flex-direction: row;
		gap: var(--spacing-6);
		justify-content: flex-start;
		align-items: center;
		flex-wrap: nowrap;
		
		div {
			img {
				max-height: 300px;
			}
			&:not(:only-child) img {
			aspect-ratio: 1;
			object-fit: cover;
		}
		}

		/* one item */
		div:first-child:nth-last-child(1) {
			width: 100%;
		}

		/* two items */
		div:first-child:nth-last-child(2),
		div:first-child:nth-last-child(2) ~ div {
			width: 50%;
		}

		/* three items */
		div:first-child:nth-last-child(3),
		div:first-child:nth-last-child(3) ~ div {
			width: 33.3333%;
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

	@keyframes newpost {
		from {
			background-color: var(--success-highlight);
		}
		to {
			background-color: transparent;
		}
	}
	:global(.newpost) {
		animation-name: newpost;
		animation-duration: 2.5s;
		animation-timing-function: ease-out;
	}

	@media (prefers-color-scheme: dark) {
		.root {
			&:not(:last-child) {
				border-bottom-color: var(--grey-500);
			}

			&:hover {
				background-color: var(--grey-500);
			}
		}

		:global(svg) {
			fill: var(--grey-100);
			width: 16px;
			height: 16px;
		}
	}
	
</style>
