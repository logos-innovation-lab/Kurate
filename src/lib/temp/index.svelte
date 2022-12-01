<script lang="ts">
	import type { Post } from '$lib/stores/post'
	import { users, type User } from '$lib/stores/user'
	import { profile } from '$lib/stores/profile'
	import { posts } from '$lib/stores/post'
	import Button from '$lib/components/button.svelte'
	import image1 from '$lib/temp/assets/1.png'
	import image2 from '$lib/temp/assets/2.png'
	import image3 from '$lib/temp/assets/3.png'

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
		{
			timestamp: new Date().setDate(new Date().getDate() - 3),
			text: 'Unicorn etsy jean shorts gatekeep. Same air plant hashtag tousled poutine pinterest, activated charcoal celiac austin chartreuse.',
			user: {
				address: '0x33FEd84c219139A464Cc2aF5643584ab51176DaB',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 3),
			text: "Y'all should go check this amazing online magazine https://two.compost.digital/",
			user: {
				name: 'Cryptocowboy',
				avatar: image3,
				address: '0x0554369c1f47B130104fC8A6aa5a94fF3b06b0e1',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 3),
			text: "I'm baby tacos literally vaporware banh mi fam listicle jean shorts coloring book enamel pin occupy",
			user: {
				address: '0x33FEd84c219139A464Cc2aF5643584ab51176DaB',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 4),
			text: 'Decision making by awkward silence.',
			user: {
				name: 'CoyoteRide',
				avatar: image1,
				address: '0x2d37a46fad14c4fcaba66660da6a5d99af88bf71',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 4),
			text: "It's an amazing trigger within human nature: the minute someone acknowledges their flaws, not only do we tend to forgive them, but we actually come to admire them.",
			user: {
				name: 'Lemur',
				avatar: image2,
				address: '0x032b3c7a6af9bbf38838f582acc8e4074932f2b8',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 5),
			text: 'What were the skies like when you were young?',
			user: {
				address: '0x547172511e83121ea8b27f25dc00e7294d9b8b6d',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 5),
			text: 'Unicorn etsy jean shorts gatekeep. Same air plant hashtag tousled poutine pinterest, activated charcoal celiac austin chartreuse.',
			user: {
				address: '0x33FEd84c219139A464Cc2aF5643584ab51176DaB',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 6),
			text: "Y'all should go check this amazing online magazine https://two.compost.digital/",
			user: {
				name: 'Cryptocowboy',
				avatar: image3,
				address: '0x0554369c1f47B130104fC8A6aa5a94fF3b06b0e1',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 6),
			text: "I'm baby tacos literally vaporware banh mi fam listicle jean shorts coloring book enamel pin occupy",
			user: {
				address: '0x33FEd84c219139A464Cc2aF5643584ab51176DaB',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 7),
			text: 'Decision making by awkward silence.',
			user: {
				name: 'CoyoteRide',
				avatar: image1,
				address: "We should forgive each other for stupid things we've said in the past.",
			},
		},
	]
	function populateWithData() {
		posts.set(testPosts)
		const uniqueUsers: Map<string, User> = new Map()
		testPosts.forEach((p) => uniqueUsers.set(p.user.address, p.user))
		console.log(Array.from(uniqueUsers.values()))
		users.set(Array.from(uniqueUsers.values()))
		profile.set({
			profiles: [
				{
					name: 'CoyoteRide',
					avatar: image1,
					address: "We should forgive each other for stupid things we've said in the past.",
				},
				{
					address: '0x33FEd84c219139A464Cc2aF5643584ab51176DaB',
				},
			],
		})
	}
</script>

<div class="root">
	<span>There are no posts yet</span>
	<Button on:click={populateWithData} label="populate with testdata" />
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
