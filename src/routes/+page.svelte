<script lang="ts">
	import { goto } from '$app/navigation'
	import Header from '$lib/components/header.svelte'
	import Post from '$lib/components/post.svelte'
	import Populate from '$lib/temp/index.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
	import { ROUTES } from '$lib/routes'
</script>

<div>
	<Header user={$profile.active} />

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
</style>
