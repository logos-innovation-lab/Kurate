<script lang="ts">
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import Loading from '$lib/components/loading.svelte'
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
	import SectionTitle from '$lib/components/section-title.svelte'
	import Dropdown from '$lib/components/dropdown.svelte'
	import DropdownItem from '$lib/components/dropdown-item.svelte'
	import Search from '$lib/components/search.svelte'

	import { posts } from '$lib/stores/post'
	import { personas } from '$lib/stores/persona'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'
	import adapter from '$lib/adapters'
	import { canConnectWallet } from '$lib/services'
	import { onDestroy, onMount } from 'svelte'

	type SortBy = 'date' | 'alphabetical'
	interface SortByOption {
		sortBy: SortBy
		label: string
	}

	const groupId = $page.params.id
	$: persona = $personas.all.get(groupId)
	$: personaPosts = $posts.data.get(groupId)
	let sortAsc = false
	let sortBy: SortBy = 'date'
	let filterQuery = ''
	let unsubscribe: () => unknown

	const sortByOptions: SortByOption[] = [
		{ sortBy: 'date', label: 'Sort by date of creation' },
		{ sortBy: 'alphabetical', label: 'Sort by name (alphabetical)' },
	]

	onMount(async () => {
		adapter.subscribePersonaPosts(groupId).then((unsub) => (unsubscribe = unsub))
	})

	onDestroy(() => {
		if (unsubscribe) unsubscribe()
	})

	let y: number
	let onBack = () => goto(ROUTES.HOME)

	const addToFavorite = () => adapter.addPersonaToFavorite(groupId, persona)
	const removeFromFavorite = () => adapter.removePersonaFromFavorite(groupId, persona)
</script>

<svelte:window bind:scrollY={y} />

{#if $personas.loading || personaPosts?.loading}
	<Loading title="Loading Persona" onBack={() => history.back} fullPage>
		<svelte:fragment slot="title">Please wait</svelte:fragment>
	</Loading>
{:else if $personas.error || personaPosts?.error}
	<Container>
		<InfoBox>
			<div>Something went wrong</div>
		</InfoBox>
	</Container>
{:else if persona === undefined}
	<Container>
		<InfoBox>
			<div>There is no persona with group ID {groupId}</div>
		</InfoBox>
	</Container>
{:else}
	<Header title={persona.name} {onBack} onlyScrolled>
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
				<Dropdown>
					<Button slot="button" icon={SettingsView} />

					{#each sortByOptions as option}
						<DropdownItem
							active={sortBy === option.sortBy}
							onClick={() => (sortBy = option.sortBy)}
						>
							{option.label}
						</DropdownItem>
					{/each}
				</Dropdown>
				<Button
					icon={sortAsc ? SortAscending : SortDescending}
					on:click={() => (sortAsc = !sortAsc)}
				/>
			</svelte:fragment>
			<Search bind:filterQuery />
		</SectionTitle>
		{#if !personaPosts || personaPosts.loading}
			<Loading>
				<svelte:fragment slot="title">Loading posts</svelte:fragment>
			</Loading>
		{:else if personaPosts.approved.length == 0}
			<Container>
				<InfoBox>
					<p>There are no posts yet</p>
				</InfoBox>
			</Container>
		{:else}
			<Grid>
				{#each personaPosts.approved
					.filter((post) => post.text.toLowerCase().includes(filterQuery.toLowerCase()))
					.sort((a, b) => {
						if (sortBy === 'date') {
							return sortAsc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
						} else {
							return sortAsc ? a.text.localeCompare(b.text) : b.text.localeCompare(a.text)
						}
					}) as post}
					<Post {post} on:click={() => goto(ROUTES.PERSONA_POST(groupId, post.postId))} />
				{/each}
			</Grid>
		{/if}
	</PersonaDetail>
{/if}
