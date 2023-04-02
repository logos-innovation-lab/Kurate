<script lang="ts">
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import Star from '$lib/components/icons/star.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import StarFilled from '$lib/components/icons/star_filled.svelte'
	import Hourglass from '$lib/components/icons/hourglass.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'

	import Grid from '$lib/components/grid.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'
	import Header from '$lib/components/header.svelte'
	import Container from '$lib/components/container.svelte'
	import InfoBox from '$lib/components/info-box.svelte'

	import { posts } from '$lib/stores/post'
	import { personas } from '$lib/stores/persona'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'
	import adapter from '$lib/adapters'
	import { canConnectWallet } from '$lib/services'
	import { onDestroy, onMount } from 'svelte'
	import SectionTitle from '$lib/components/section-title.svelte'
	import Dropdown from '$lib/components/dropdown.svelte'
	import DropdownItem from '$lib/components/dropdown-item.svelte'
	import Search from '$lib/components/search.svelte'

	const groupId = $page.params.id
	const persona = $personas.all.get(groupId)
	let personaPosts = $posts.data.get(groupId)
	let sortAsc = true
	let sortBy: 'date' | 'alphabetical' = 'date'
	let filterQuery = ''
	let unsubscribe: () => unknown

	onMount(() => {
		adapter.syncPersonaPosts(groupId).then((unsub) => (unsubscribe = unsub))
	})

	onDestroy(() => {
		if (unsubscribe) unsubscribe()
	})

	let y: number
	let onBack = () => history.back()

	const addToFavorite = () => adapter.addPersonaToFavorite(groupId, persona)
	const removeFromFavorite = () => adapter.removePersonaFromFavorite(groupId, persona)

	$: personaPosts = $posts.data.get(groupId)
</script>

<svelte:window bind:scrollY={y} />

{#if persona === undefined}
	<Container>
		<InfoBox>
			<div>There is no persona with group ID {groupId}</div>
		</InfoBox>
	</Container>
{:else}
	<div class={`header ${y > 0 ? 'scrolled' : ''}`}>
		<Header title={persona.name} {onBack}>
			{#if $profile.signer !== undefined}
				<Button variant="primary" icon={Edit} on:click={() => goto(ROUTES.POST_NEW(groupId))} />
			{:else}
				<Button
					variant="primary"
					icon={Wallet}
					on:click={adapter.signIn}
					disabled={!canConnectWallet()}
				/>
			{/if}
		</Header>
	</div>
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		postsCount={persona.postsCount}
		participantsCount={persona.participantsCount}
		minReputation={persona.minReputation}
		picture={persona.picture}
		cover={persona.cover}
		onBack={() => goto(ROUTES.HOME)}
	>
		<svelte:fragment slot="button_top">
			{#if $profile.signer !== undefined}
				{#if $personas.favorite.includes(groupId)}
					<Button
						icon={StarFilled}
						variant="overlay"
						label="Remove favorite"
						on:click={removeFromFavorite}
					/>
				{:else}
					<Button icon={Star} variant="overlay" label="Add to favorites" on:click={addToFavorite} />
				{/if}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="button_primary">
			{#if $profile.signer !== undefined}
				<Button
					variant="primary"
					label="Submit post"
					icon={Edit}
					on:click={() => goto(ROUTES.POST_NEW(groupId))}
				/>
			{:else}
				<Button
					variant="primary"
					label="Connect to post"
					icon={Wallet}
					on:click={adapter.signIn}
					disabled={!canConnectWallet()}
				/>
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="button_other">
			<Button
				label="Review pending"
				icon={Hourglass}
				on:click={() => goto(ROUTES.PERSONA_PENDING(groupId))}
			/>
		</svelte:fragment>

		<SectionTitle title="All posts">
			<svelte:fragment slot="buttons">
				{#if $profile.signer !== undefined}
					<Dropdown>
						<Button slot="button" icon={SettingsView} />

						<DropdownItem active={sortBy === 'date'} onClick={() => (sortBy = 'date')}>
							Sort by date of creation
						</DropdownItem>
						<DropdownItem
							active={sortBy === 'alphabetical'}
							onClick={() => (sortBy = 'alphabetical')}
						>
							Sort by name (alphabetical)
						</DropdownItem>
					</Dropdown>
					<Button
						icon={sortAsc ? SortAscending : SortDescending}
						on:click={() => (sortAsc = !sortAsc)}
					/>
				{/if}
			</svelte:fragment>
			{#if $profile.signer !== undefined}
				<Search bind:filterQuery />
			{/if}
		</SectionTitle>

		{#if !personaPosts || personaPosts.loading}
			<Container>
				<InfoBox>
					<p>Loading posts...</p>
				</InfoBox>
			</Container>
		{:else if personaPosts.approved.length == 0}
			<Container>
				<InfoBox>
					<p>There are no posts yet</p>
				</InfoBox>
			</Container>
		{:else}
			<Grid>
				{#each personaPosts.approved as hash}
					<Post post={personaPosts.all.get(hash)} on:click={() => goto(ROUTES.PERSONA_POST(groupId, hash))} />
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
