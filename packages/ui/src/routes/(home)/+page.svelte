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
	let sortAsc = true
	let sortBy: 'date' | 'activity' | 'participantsCount' | 'postsCount' | 'alphabetical' = 'date'

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
				<Dropdown icon={SettingsView}>
					<DropdownItem active={sortBy === 'date'} on:click={() => (sortBy = 'date')}>
						Sort by date of creation
					</DropdownItem>
					<DropdownItem active={sortBy === 'activity'} on:click={() => (sortBy = 'activity')}>
						Sort by recent activity
					</DropdownItem>
					<DropdownItem
						active={sortBy === 'participantsCount'}
						on:click={() => (sortBy = 'participantsCount')}
					>
						Sort by number of participants
					</DropdownItem>
					<DropdownItem active={sortBy === 'postsCount'} on:click={() => (sortBy = 'postsCount')}>
						Sort by number of posts
					</DropdownItem>
					<DropdownItem
						active={sortBy === 'alphabetical'}
						on:click={() => (sortBy = 'alphabetical')}
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
		{#each [...$personas.all].filter(([, data]) => data.name
				.toLowerCase()
				.includes(filterQuery.toLowerCase())) as [groupId, data]}
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
