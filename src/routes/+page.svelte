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
	import { ROUTES } from '$lib/routes'
</script>

<div>
	<Header user={$profile.active} />
	{#if $profile.active !== undefined}
		<div>
			<Avatar src={$profile.active.avatar} on:click={() => goto(ROUTES.PROFILE)} />
			Share freely...
			<Button
				variant="primary"
				label="Create post"
				icon={Edit}
				on:click={() => goto(ROUTES.POST_NEW)}
			/>
		</div>
	{:else if $profile.key?.publicKey !== undefined}
		<div>
			<Button
				variant="primary"
				label="Select identity"
				icon={User}
				on:click={() => goto(ROUTES.PROFILE)}
			/>
			Select an identity to use with your account.
		</div>
	{:else}
		<WalletConnect />
	{/if}

	<div class="title">Public timeline</div>

	{#each $posts as post}
		<Post
			{post}
			onUserClick={(user) => {
				goto(ROUTES.PROFILE_ADDRESS(user.address))
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
