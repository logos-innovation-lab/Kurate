<script lang="ts">
	import { goto } from '$app/navigation'
	import Header from '$lib/components/header.svelte'
	import Post from '$lib/components/post.svelte'
	import WalletConnect from '$lib/components/wallet-connect.svelte'
	import Populate from '$lib/temp/index.svelte'

	import { posts } from '$lib/stores/post'
</script>

<div>
	<Header />
	<WalletConnect />

	<div class="title">Public timeline</div>

	{#if $posts.length < 1}
		<Populate />
	{:else}
		{#each $posts as post}
			<Post
				{post}
				onUserClick={(user) => {
					goto(`/profile/${user.address}`)
				}}
			/>
		{/each}
	{/if}
</div>

<style>
	.title {
		height: 20px;
		font-size: 16px;
		font-weight: 600;
		padding: var(--spacing-24) var(--spacing-12);
	}
</style>
