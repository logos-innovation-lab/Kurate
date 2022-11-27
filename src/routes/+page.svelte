<script lang="ts">
	import { goto } from '$app/navigation'
	import Header from '$lib/components/header.svelte'
	import Post from '$lib/components/post.svelte'
	import WalletConnect from '$lib/components/wallet-connect.svelte'
	import Populate from '$lib/temp/index.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
</script>

<div>
	<Header user={$profile.active} />
	<WalletConnect />

	<div class="title">Public timeline</div>

	{#each $posts as post}
		<Post
			{post}
			onUserClick={(user) => {
				goto(`/profile/${user.address}`)
			}}
		/>
	{:else}
		<Populate />
	{/each}
</div>

<style>
	.title {
		height: 20px;
		font-size: 16px;
		font-weight: 600;
		padding: var(--spacing-24) var(--spacing-12);
	}
</style>
