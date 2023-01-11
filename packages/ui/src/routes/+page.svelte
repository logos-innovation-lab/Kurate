<script lang="ts">
	import Header from '$lib/components/header.svelte'
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
	<Header loggedin={$profile.signer !== undefined} />

	{#if $profile.signer !== undefined && y == 0}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="new-post-button" on:click={() => goto('/post/new')}>
			Share freely...
			<Button variant="primary" label="Create post" icon={Edit} />
		</div>
	{:else}
		<WalletConnect />
	{/if}

	{#each $posts as post}
		<Post {post} />
	{:else}
		<p>There are no posts yet</p>
	{/each}
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
	}
</style>
