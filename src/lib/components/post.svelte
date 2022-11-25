<script lang="ts">
	import Avatar from './avatar.svelte'
	import { formatAddress, formatDateFromNow } from '$lib/utils'

	import type { Post } from '$lib/stores/post'
	import type { User } from '$lib/stores/user'

	export let post: Post
	export let onUserClick: ((user: User) => void) | undefined = undefined
</script>

<div class="root">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="content-left" on:click={() => onUserClick && onUserClick(post.user)}>
		<Avatar src={post.user.avatar} />
	</div>
	<div class="content-right">
		<div class="post-info">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="username" on:click={() => onUserClick && onUserClick(post.user)}>
				{post.user.name ?? 'Anonymous'}
			</div>
			{#if post.user.address !== undefined}
				<div>{formatAddress(post.user.address)}</div>
			{/if}
			<div class="color-grey">•</div>
			<div class="color-grey">{formatDateFromNow(post.timestamp)}</div>
		</div>
		{post.text}
	</div>
</div>

<style>
	.root {
		border-top: 1px solid var(--color-grey-background);
		padding: var(--spacing-12);
		display: flex;
		flex-direction: row;
	}
	.content-left {
		flex-shrink: 0;
	}
	.content-right {
		margin-left: var(--spacing-12);
		flex-grow: 1;
	}
	.post-info {
		display: flex;
		flex-direction: row;
		margin-bottom: var(--spacing-3);
	}
	.post-info > div {
		margin-right: var(--spacing-6);
		font-family: 'Source Code Pro';
		font-size: 14px;
	}
	.post-info > div.username {
		font-family: 'Source Sans Pro';
		font-weight: 600;
	}
	.post-info > div:last-child {
		margin-right: 0px;
	}
	.color-grey {
		color: #909090;
	}
</style>
