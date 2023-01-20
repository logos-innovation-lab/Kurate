<script lang="ts">
	import type { Post } from '$lib/stores/post'
	import { users, type User } from '$lib/stores/user'
	import { posts } from '$lib/stores/post'
	import Button from '$lib/components/button.svelte'

	const testPosts: Post[] = [
		{
			timestamp: new Date().setHours(new Date().getHours() - 6),
			text: 'Corned beef culpa beef ribs, doner laboris buffalo filet mignon dolore laborum salami tail deserunt eiusmod commodo do. Laborum enim cow tail turducken swine sed shankle aute short loin velit ground round sirloin est. Pork loin flank jowl eu, ad nulla officia ball tip tenderloin spare ribs turducken. Nisi in leberkas, cupim pancetta pork shankle meatball incididunt beef pork chop. Ham andouille ea enim pork belly ipsum boudin pancetta jowl. Excepteur ball tip ut ham. Meatball consequat landjaeger meatloaf. Ut cow shank, salami drumstick ut picanha pork ea non. Shankle drumstick dolor eu esse sed do dolore. Salami nisi eu swine. Pork belly et short ribs aute laborum turducken jowl.',
			user: {
				name: 'CoyoteRide',
				address: '0x2d37a46fad14c4fcaba66660da6a5d99af88bf71',
			},
		},
		{
			timestamp: new Date().setHours(new Date().getHours() - 6),
			text: "It's an amazing trigger within human nature: the minute someone acknowledges their flaws, not only do we tend to forgive them, but we actually come to admire them.",
			user: {
				name: 'Lemur',
				address: '0x032b3c7a6af9bbf38838f582acc8e4074932f2b8',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 1),
			text: 'What were the skies like when you were young?',
			user: {
				address: '0x547172511e83121ea8b27f25dc00e7294d9b8b6d',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 3),
			text: 'Unicorn etsy jean shorts gatekeep.',
			user: {
				address: '0x33FEd84c219139A464Cc2aF5643584ab51176DaB',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 3),
			text: "Y'all should go check this amazing online magazine https://two.compost.digital/",
			user: {
				name: 'Cryptocowboy',
				address: '0x0554369c1f47B130104fC8A6aa5a94fF3b06b0e1',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 3),
			text: "Minim salami consectetur excepteur. Consequat proident elit salami chislic quis ullamco fugiat ut incididunt est. Cupidatat short ribs irure, chicken pork chop laboris sausage drumstick anim dolore porchetta cupim non beef in. Irure meatloaf consectetur pig occaecat porchetta et brisket rump. Pork chop short loin tri-tip elit veniam sausage nulla. Eiusmod tail sirloin, pork burgdoggen voluptate mollit beef fugiat pancetta et sint meatball ball tip. Sunt excepteur veniam bresaola occaecat shank, tongue sed. Porchetta exercitation irure non pork loin elit fatback frankfurter consequat ut bresaola tri-tip. Drumstick chicken aliqua, alcatra chuck tail meatball eiusmod consequat pig. Prosciutto short ribs venison kielbasa kevin quis ullamco boudin aliqua. Non dolor brisket leberkas nostrud landjaeger in turkey in ipsum duis aliqua cupidatat. Ad id magna sirloin. Aliqua ball tip duis ex boudin in. Biltong pancetta non minim filet mignon. Fugiat ribeye ullamco sunt turkey frankfurter tenderloin. Esse kevin kielbasa ham hock rump ex short ribs aliquip. ",
			user: {
				address: '0x33FEd84c219139A464Cc2aF5643584ab51176DaB',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 4),
			text: 'Decision making by awkward silence.',
			user: {
				name: 'CoyoteRide',
				address: '0x2d37a46fad14c4fcaba66660da6a5d99af88bf71',
			},
		},
		{
			timestamp: new Date().setDate(new Date().getDate() - 4),
			text: "It's an amazing trigger within human nature: the minute someone acknowledges their flaws, not only do we tend to forgive them, but we actually come to admire them.",
			user: {
				name: 'Lemur',
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
				address: '0x2d37a46fad14c4fcaba66660da6a5d99af88bf71',
			},
		},
	]
	function populateWithData() {
		posts.set(testPosts)
		const uniqueUsers: Map<string, User> = new Map()
		testPosts.forEach((p) => uniqueUsers.set(p.user.address, p.user))
		users.set(Array.from(uniqueUsers.values()))
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
