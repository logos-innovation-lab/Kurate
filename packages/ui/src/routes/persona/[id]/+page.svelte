<script lang="ts">
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import Star from '$lib/components/icons/star.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import StarFilled from '$lib/components/icons/star_filled.svelte'
	import Hourglass from '$lib/components/icons/hourglass.svelte'
	import Grid from '$lib/components/grid.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'
	import Header from '$lib/components/header.svelte'

	import { posts } from '$lib/stores/post'
	import { personas } from '$lib/stores/persona'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'
	import { connectWallet } from '$lib/services'

	const persona = $personas.all.get($page.params.id)

	const handleConnect = async () => {
		try {
			const signer = await connectWallet()
			const address = await signer.getAddress()

			$profile = { signer, address }
		} catch (err) {
			console.error(err)
		}
	}

	let y: number
</script>

<svelte:window bind:scrollY={y} />

{#if persona === undefined}
	<div>There is no persona with group ID {$page.params.id}</div>
{:else}
	<div class={`header ${y > 0 ? 'scrolled' : ''}`}>
		<Header title={persona.name}>
			<svelte:fragment slot="btns">
				{#if $profile.signer !== undefined}
					<Button
						variant="primary"
						icon={Edit}
						on:click={() => goto(ROUTES.POST_NEW($page.params.id))}
					/>
				{:else}
					<Button variant="primary" icon={Wallet} on:click={() => handleConnect()} />
				{/if}
			</svelte:fragment>
		</Header>
	</div>
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		postsCount={persona.postsCount}
		bind:picture={persona.picture}
		bind:cover={persona.cover}
	>
		<svelte:fragment slot="button_top">
			{#if $profile.signer !== undefined}
				{#if $personas.favorite.includes($page.params.id)}
					<Button icon={StarFilled} variant="overlay" label="Remove favorite" />
				{:else}
					<Button icon={Star} variant="overlay" label="Add to favorites" />
				{/if}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="button_primary">
			{#if $profile.signer !== undefined}
				<Button
					variant="primary"
					label="Submit post"
					icon={Edit}
					on:click={() => goto(ROUTES.POST_NEW($page.params.id))}
				/>
			{:else}
				<Button
					variant="primary"
					label="Connect to post"
					icon={Wallet}
					on:click={() => handleConnect()}
				/>
			{/if}
		</svelte:fragment>

		<div class="note">"Review pending" button needs action</div>

		<svelte:fragment slot="button_other">
			<!-- NEED TO ADD CORRECT ACTION HERE -->
			<Button label="Review pending" icon={Hourglass} />
		</svelte:fragment>

		<div class="note">place filter component here (under construction)</div>

		{#if $posts.loading}
			<p>Loading posts...</p>
		{:else if $posts.posts.length == 0}
			<p>There are no posts yet</p>
		{:else}
			<Grid>
				{#each $posts.posts as post}
					<!-- NEEDS ONCLICK ACTION => SHOULD GO TO POST PAGE -->
					<Post {post} on:click />
				{/each}
			</Grid>
		{/if}
	</PersonaDetail>
{/if}

<style lang="scss">
	.header {
		position: fixed;
		inset: -100% 0 auto;
		z-index: 100;
		transition: inset 0.5s;

		&.scrolled {
			inset: 0 0 auto;
			transition: inset 0.3s;
		}
	}
</style>
