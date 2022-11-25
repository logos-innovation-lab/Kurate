<script lang="ts">
	import type { Post } from '$lib/stores/post'
	import { users } from '$lib/stores/user'
	import { posts } from '$lib/stores/post'
	import Button from '$lib/components/button.svelte'
	import image1 from '$lib/temp/assets/1.png'
	import image2 from '$lib/temp/assets/2.png'

	const testPosts: Post[] = [
		{
			timestamp: new Date().setHours(new Date().getHours() - 6),
			text: 'Decision making by awkward silence.',
			user: {
				name: 'CoyoteRide',
				avatar: image1,
				address: '0x2d37a46fad14c4fcaba66660da6a5d99af88bf71',
			},
		},
		{
			timestamp: new Date().setHours(new Date().getHours() - 6),
			text: "It's an amazing trigger within human nature: the minute someone acknowledges their flaws, not only do we tend to forgive them, but we actually come to admire them.",
			user: {
				name: 'Lemur',
				avatar: image2,
				address: '0x032b3c7a6af9bbf38838f582acc8e4074932f2b8',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 2),
			text: 'What were the skies like when you were young?',
			user: {
				address: '0x547172511e83121ea8b27f25dc00e7294d9b8b6d',
			},
		},
	]
	function populateWithData() {
		posts.set(testPosts)
		users.set(testPosts.map((p) => p.user))
	}
</script>

<div class="root">
	<span>There are no posts yet</span>
	<Button click={populateWithData} label="populate with testdata" />
</div>

<style>
	.root {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-top: 1px solid var(--color-grey-background);
		padding: var(--spacing-12);
	}
	span {
		margin-bottom: var(--spacing-12);
	}
</style>
