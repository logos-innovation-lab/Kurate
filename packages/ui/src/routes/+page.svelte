<script lang="ts">
	import HeaderTop from '$lib/components/header-top.svelte'
	import HeaderDescription from '$lib/components/header-description.svelte'
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import WalletConnect from '$lib/components/wallet-connect.svelte'
	import Edit from '$lib/components/icons/edit.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'

	let y: number
</script>

<svelte:window bind:scrollY={y} />
<div>
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
		<div class="posts">
			{#each $posts.posts as post}
				<Post {post} />
			{:else}
				<p>There are no posts yet</p>
			{/each}
		</div>
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
		border-bottom: 1px solid var(--grey-200);
		cursor: pointer;
	}
	.wrapper {
		max-width: 1280px;
		margin: 0 auto 0;
		@media (min-width: 1280px) {
			border-left: 1px solid var(--grey-200);
		}

		@media (prefers-color-scheme: dark) {
			border-left-color: var(--grey-500);
		}
	}
	.posts {
		column-width: 100%;
		column-gap: 0;

		@media (min-width: 739px) {
			column-width: 320px;
		}
	}
</style>
