<script lang="ts">
	import Post from '../../../lib/components/post.svelte'
	import Button from '../../../lib/components/button.svelte'
	import Edit from '../../../lib/components/icons/edit.svelte'
	import Star from '../../../lib/components/icons/star.svelte'
	import StarFilled from '../../../lib/components/icons/star_filled.svelte'

	import { posts } from '../../../lib/stores/post'
	import { personas } from '../../../lib/stores/persona'
	import { profile } from '../../../lib/stores/profile'
	import goto from 'page'
	import { isBrowser } from 'browser-or-node'
	import {page} from "../../../lib/stores/route"
	import Masonry from '../../../lib/masonry.svelte'
	import { ROUTES } from '../../../lib/routes'
	import PersonaDetail from '../../../lib/components/persona_detail.svelte'

	let windowWidth: number = isBrowser ? window.innerWidth : 0

	function getMasonryColumnWidth(windowInnerWidth: number) {
		if (windowInnerWidth < 739) return '100%'
		if (windowInnerWidth < 1060) return 'minmax(min(100%/2, max(320px, 100%/2)), 1fr)'
		if (windowInnerWidth < 1381) return 'minmax(min(100%/3, max(320px, 100%/3)), 1fr)'
		if (windowInnerWidth < 1702) return 'minmax(min(100%/4, max(320px, 100%/4)), 1fr)'
		if (windowInnerWidth < 2023) return 'minmax(min(100%/5, max(320px, 100%/5)), 1fr)'
		if (windowInnerWidth < 2560) return 'minmax(min(100%/6, max(320px, 100%/6)), 1fr)'
		if (windowInnerWidth < 3009) return 'minmax(min(100%/7, max(320px, 100%/7)), 1fr)'
		return 'minmax(323px, 1fr)'
	}

	const persona = $personas.all.get($page.params.groupId)
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if persona === undefined}
	<div>There is no persona with group ID {$page.params.id}</div>
{:else}
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		bind:picture={persona.picture}
		bind:cover={persona.cover}
	>
		<svelte:fragment slot="button_top">
			{#if $personas.favorite.includes($page.params.id)}
				<Button icon={StarFilled} variant="primary" label="Remove favorite" />
			{:else}
				<Button icon={Star} variant="primary" label="Add to favorites" />
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
			{/if}</svelte:fragment
		>

		{#if $posts.loading}
			<p>Loading posts...</p>
		{:else if $posts.posts.length == 0}
			<p>There are no posts yet</p>
		{:else}
			<Masonry gridGap="0" colWidth={getMasonryColumnWidth(windowWidth)} items={$posts.posts}>
				{#each $posts.posts as post}
					<Post {post} />
				{/each}
			</Masonry>
		{/if}
	</PersonaDetail>
{/if}

<style lang="scss">
</style>
