<script lang="ts">
	import Add from '$lib/components/icons/add.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'

	import Button from '$lib/components/button.svelte'
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

	let filterQuery = ''
	let sortAsc = false
	let sortBy: 'date' | 'participantsCount' | 'postsCount' | 'alphabetical' = 'date'

	function createDraft() {
		goto(ROUTES.PERSONA_NEW)
	}
</script>

{#if $personas.loading}
	<SectionTitle title="Loading personas..." />
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
				<Dropdown>
					<Button slot="button" icon={SettingsView} />

					<DropdownItem active={sortBy === 'date'} onClick={() => (sortBy = 'date')}>
						Sort by date of creation
					</DropdownItem>
					<DropdownItem
						active={sortBy === 'participantsCount'}
						onClick={() => (sortBy = 'participantsCount')}
					>
						Sort by number of participants
					</DropdownItem>
					<DropdownItem active={sortBy === 'postsCount'} onClick={() => (sortBy = 'postsCount')}>
						Sort by number of posts
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
