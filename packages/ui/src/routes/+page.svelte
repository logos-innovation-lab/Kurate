<script lang="ts">
	import Header from '$lib/components/header.svelte'
	import Post from '$lib/components/post.svelte'
	import Populate from '$lib/temp/index.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
</script>

<div>
	<Header loggedin={$profile.signer !== undefined} />

	{#each $posts as post}
		<Post {post} />
	{:else}
		<Populate />
	{/each}
</div>
