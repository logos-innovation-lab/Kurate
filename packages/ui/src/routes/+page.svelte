<script lang="ts">
	// import Header from '$lib/components/header.svelte'
	import HeaderTop from '$lib/components/header-top.svelte'
	import HeaderDescription from '$lib/components/header-description.svelte'
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import WalletConnect from '$lib/components/wallet-connect.svelte'
	import Edit from '$lib/components/icons/edit.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment';
	import Masonry from '$lib/masonry.svelte'

	let width: number = browser ? window.innerWidth : 0
	let newColWidth: string

	function checkWidth(w: number) {
        let val = '100%'

		if (w < 739) {
			val = '100%'
		}

		else if (w < 1060) {
			val = 'minmax(min(100%/2, max(320px, 100%/2)), 1fr)'
		}

		else if (w < 1381) {
			val = 'minmax(min(100%/3, max(320px, 100%/3)), 1fr)'
		}

		else if (w < 1702) {
			val = 'minmax(min(100%/4, max(320px, 100%/4)), 1fr)'
		}

		else if (w < 2023) {
			val = 'minmax(min(100%/5, max(320px, 100%/5)), 1fr)'
		}

		else if (w < 2560) {
			val = 'minmax(min(100%/6, max(320px, 100%/6)), 1fr)'
		}

		else if (w < 3009) {
			val = 'minmax(min(100%/7, max(320px, 100%/7)), 1fr)'
		}

		else {
			val = 'minmax(323px, 1fr)'			
		}

        return val
    }
	
    $: newColWidth = checkWidth(width).toString()

</script>

<svelte:window bind:innerWidth={width} />

<div>


	<!-- <Header loggedin={$profile.signer !== undefined} /> -->

	<HeaderTop loggedin={$profile.signer !== undefined} />
	<HeaderDescription />

	<div class="wrapper">
		{#if $profile.signer !== undefined}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="new-post-button" on:click={() => goto('/post/new')}>
				Share freely...
				<Button variant="primary" label="Create post" icon={Edit} />
			</div>
		{:else}
			<WalletConnect />
		{/if}

		<Masonry gridGap="0" colWidth={newColWidth} items={$posts.posts}>
			{#each $posts.posts as post}
				<Post {post} />
			{:else}
				<p>There are no posts yet</p>
			{/each}
		</Masonry>
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
