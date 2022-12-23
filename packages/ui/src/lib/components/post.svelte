<script lang="ts">
	import { formatDateAndTime } from '$lib/utils'

	import type { Post } from '$lib/stores/post'

	let cls: string | undefined = undefined
	export { cls as class }
	export let post: Post
</script>

<div class={`root ${cls}`}>
	<div class="content-wrapper">
		<div class="user-info">
			<div class="faded">{formatDateAndTime(post.timestamp)}</div>
		</div>
		<div class="post-content">{post.text}</div>
	</div>
</div>

<style lang="scss">
	.root {
		border-bottom: 1px solid var(--grey-200);
		padding: var(--spacing-12);
		display: flex;
		gap: var(--spacing-12);
		flex-direction: row;

		@media (prefers-color-scheme: dark) {
			border-bottom-color: var(--grey-500);
		}
	}
	.user-img {
		flex-shrink: 0;
	}
	.content-wrapper {
		flex-grow: 1;
	}
	.user-info {
		display: flex;
		flex-direction: row;
		gap: var(--spacing-6);
		margin-bottom: var(--spacing-3);
		// font-family: var(--font-mono);
		font-size: var(--font-size-sm);

		// div.username {
		// 	// font-family: var(--font-body);
		// 	font-weight: 600;
		// }
	}
	.post-content {
		font-family: var(--font-serif);
		line-height: 1.38;
	}
	.faded {
		color: var(--grey-300);
		@media (prefers-color-scheme: dark) {
			color: var(--grey-400);
		}
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
</style>
