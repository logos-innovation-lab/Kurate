<script lang="ts">
	import Header from '$lib/components/header.svelte'
	import Post from '$lib/components/post.svelte'
	import Populate from '$lib/temp/index.svelte'
	import Button from '$lib/components/button.svelte'
	import WalletConnect from '$lib/components/wallet-connect.svelte'
	import Edit from '$lib/components/icons/edit.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
</script>

<div>
	<Header loggedin={$profile.key !== undefined} />

	{#if $profile.key?.publicKey !== undefined}
		<div>
			Share freely...
			<Button
				variant="primary"
				label="Create post"
				icon={Edit}
				on:click={() => goto('/post/new')}
			/>
		</div>
	{:else}
		<WalletConnect />
	{/if}

	{#each $posts as post}
		<Post {post} />
	{:else}
		<Populate />
	{/each}
</div>
