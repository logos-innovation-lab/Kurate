<script lang="ts">
	import { goto } from '$app/navigation'
	import Header from '$lib/components/header.svelte'
	import Post from '$lib/components/post.svelte'
	import WalletConnect from '$lib/components/wallet-connect.svelte'
	import Populate from '$lib/temp/index.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
	import Avatar from '$lib/components/avatar.svelte'
	import Button from '$lib/components/button.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import User from '$lib/components/icons/user.svelte'
</script>

<div>
	<Header user={$profile.active} />
	{#if $profile.active !== undefined}
		<div>
			<Avatar src={$profile.active.avatar} />
			Share freely...
			<Button
				variant="primary"
				label="Create post"
				icon={Edit}
				on:click={() => goto('/post/new')}
			/>
		</div>
	{:else if $profile.key === false}
		<div>
			<Button
				variant="primary"
				label="Select identity"
				icon={User}
				on:click={() => goto('/profile')}
			/>
			Select an identity to use with your account.
		</div>
	{:else}
		<WalletConnect />
	{/if}


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
	
</style>
