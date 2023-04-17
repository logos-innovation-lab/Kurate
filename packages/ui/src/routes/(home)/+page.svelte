<script lang="ts">
	import Add from '$lib/components/icons/add.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'

	import Button from '$lib/components/button.svelte'
	import Loading from '$lib/components/loading.svelte'
	import Dropdown from '$lib/components/dropdown.svelte'
	import DropdownItem from '$lib/components/dropdown-item.svelte'
	import Grid from '$lib/components/grid.svelte'
	import Persona from '$lib/components/persona.svelte'
	import SectionTitle from '$lib/components/section-title.svelte'
	import Search from '$lib/components/search.svelte'

	import { profile } from '$lib/stores/profile'
	import { personas } from '$lib/stores/persona'
	import { ROUTES } from '$lib/routes'

	import { goto } from '$app/navigation'

	type SortBy = 'date' | 'participantsCount' | 'postsCount' | 'alphabetical' | 'rep'
	interface SortByOption {
		sortBy: SortBy
		label: string
	}
	let filterQuery = ''
	let sortAsc = false
	let sortBy: SortBy = 'date'

	function createDraft() {
		goto(ROUTES.PERSONA_NEW)
	}

	const sortByOptions: SortByOption[] = [
		{ sortBy: 'date', label: 'Sort by date of creation' },
		{ sortBy: 'participantsCount', label: 'Sort by number of participants' },
		{ sortBy: 'postsCount', label: 'Sort by number of posts' },
		{ sortBy: 'alphabetical', label: 'Sort by name (alphabetical)' },
		{ sortBy: 'rep', label: 'Sort by reputation' },
	]
</script>

{#if $personas.loading}
	<Loading fullPage>
		<svelte:fragment slot="title">
			Loading Kurate homepage
		</svelte:fragment>
	</Loading>
{:else}
	{#if $personas.draft?.length !== 0 && $profile.signer !== undefined}
		<SectionTitle title="Draft personas">
			<Button slot="buttons" icon={Add} label="Create persona" on:click={createDraft} />
		</SectionTitle>
		<Grid>
			{#each $personas.draft as draftPersona, index}
				<Persona
					name={draftPersona.name}
					pitch={draftPersona.pitch}
					postsCount={draftPersona.posts.length}
					participantsCount={1}
					picture={draftPersona.picture}
					minReputation={draftPersona.minReputation}
					on:click={() => goto(ROUTES.PERSONA_DRAFT(index))}
				/>
			{/each}
		</Grid>
	{/if}

	{#if $personas.favorite.length !== 0 && $profile.signer !== undefined}
		<SectionTitle title="Favorites" />
		<Grid>
			{#each $personas.favorite as personaId}
				{@const persona = $personas.all.get(personaId)}
				{#if persona !== undefined}
					<Persona
						name={persona.name}
						pitch={persona.pitch}
						postsCount={persona.postsCount}
						participantsCount={persona.participantsCount}
						picture={persona.picture}
						minReputation={persona.minReputation}
						on:click={() => goto(ROUTES.PERSONA(personaId))}
					/>
				{/if}
			{/each}
		</Grid>
	{/if}

	<SectionTitle title="All personas">
		<svelte:fragment slot="buttons">
			{#if $profile.signer !== undefined}
				<Button icon={Add} label="Create persona" on:click={createDraft} />
			{/if}
			<Dropdown>
				<Button slot="button" icon={SettingsView} />

				{#each sortByOptions as option}
					<DropdownItem active={sortBy === option.sortBy} onClick={() => (sortBy = option.sortBy)}>
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

	<Grid>
		{#each [...$personas.all]
			.filter(([, data]) => data.name.toLowerCase().includes(filterQuery.toLowerCase()))
			.sort(([, a], [, b]) => {
				switch (sortBy) {
					case 'date':
						return sortAsc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
					case 'participantsCount':
						return sortAsc ? a.participantsCount - b.participantsCount : b.participantsCount - a.participantsCount
					case 'postsCount':
						return sortAsc ? a.postsCount - b.postsCount : b.postsCount - a.postsCount
					case 'alphabetical':
						return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
					case 'rep':
						return sortAsc ? a.minReputation - b.minReputation : b.minReputation - a.minReputation
				}
			}) as [groupId, data]}
			<Persona
				name={data.name}
				pitch={data.pitch}
				postsCount={data.postsCount}
				participantsCount={data.participantsCount}
				picture={data.picture}
				minReputation={data.minReputation}
				on:click={() => goto(ROUTES.PERSONA(groupId))}
			/>
		{:else}
			<p>There are no personas yet</p>
		{/each}
	</Grid>
{/if}
