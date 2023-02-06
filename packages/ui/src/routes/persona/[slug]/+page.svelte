<script lang="ts">
	import HeaderTop from '$lib/components/header-top.svelte'
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import Edit from '$lib/components/icons/edit.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import Masonry from '$lib/masonry.svelte'
	import { ROUTES } from '$lib/routes'

	let windowWidth: number = browser ? window.innerWidth : 0

	function getMasonryColumnWidth(windowInnerWidth: number) {
		if (windowInnerWidth < 739) return '100%'
		if (windowInnerWidth < 1060) return 'minmax(min(100%/2, max(320px, 100%/2)), 1fr)'
		if (windowInnerWidth < 1381) return 'minmax(min(100%/3, max(320px, 100%/3)), 1fr)'
		if (windowInnerWidth < 1702) return 'minmax(min(100%/4, max(320px, 100%/4)), 1fr)'
		if (windowInnerWidth < 2023) return 'minmax(min(100%/5, max(320px, 100%/5)), 1fr)'
		if (windowInnerWidth < 2560) return 'minmax(min(100%/6, max(320px, 100%/6)), 1fr)'
		if (windowInnerWidth < 3009) return 'minmax(min(100%/7, max(320px, 100%/7)), 1fr)'
		return 'minmax(323px, 1fr)'
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div>
	<HeaderTop address={$profile.address} />

	<Button label="GO BACK" on:click={() => goto(ROUTES.HOME)} />

	<div class="wrapper">
		{#if $profile.signer !== undefined}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="new-post-button" on:click={() => goto(ROUTES.POST_NEW($page.params.slug))}>
				Share freely...
				<Button variant="primary" label="Create post" icon={Edit} />
			</div>
		{/if}

		{#if $posts.loading}
			<p>Loading posts...</p>
		{:else if $posts.posts.length == 0}
			<p>There are no posts yet</p>
		{:else}
			<Masonry gridGap="0" colWidth={getMasonryColumnWidth(windowWidth)} items={$posts.posts}>
				{#each $posts.posts as post}
					<Post {post} />
				{/each}
			</Masonry>
		{/if}
	</div>
</div>

<style lang="scss">
	.new-post-button {
		font-family: var(--font-serif);
		padding: var(--spacing-24) var(--spacing-12);
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: var(--spacing-12);
		align-items: center;
		border-top: 1px solid var(--grey-200);
		border-bottom: 1px solid var(--grey-200);
		cursor: pointer;

		@media (min-width: 640px) {
			border-bottom: none;
		}
		@media (min-width: 1280px) {
			border: none;
			outline: 1px solid var(--grey-200);
			outline-offset: -0.5px;
		}

		@media (prefers-color-scheme: dark) {
			border-top-color: var(--grey-500);
			border-left-color: var(--grey-500);
			border-bottom-color: var(--grey-500);
			outline-color: var(--grey-500);
		}
	}
	.wrapper {
		margin-left: -1px;

		@media (min-width: 739px) {
			padding: 0 var(--spacing-48);
			margin: 0 auto 0;
		}
	}
</style>
