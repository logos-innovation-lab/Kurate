<script lang="ts">
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import Add from '$lib/components/icons/add.svelte'

	import Button from '$lib/components/button.svelte'
	import Dropdown from '$lib/components/dropdown.svelte'
	import Grid from '$lib/components/grid.svelte'
	import Persona from '$lib/components/persona.svelte'
	import SectionTitle from '$lib/components/section-title.svelte'
	import Search from '$lib/components/search.svelte'

	import { profile } from '$lib/stores/profile'
	import { personas } from '$lib/stores/persona'

	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'

	let filterQuery = ''
	let sortAsc = true

	function createDraft() {
		goto(ROUTES.PERSONA_NEW)
	}
</script>

{#if $personas.loading}
	<p>Loading personas...</p>
{:else}
	{#if $personas.draft?.length !== 0 && $profile.signer !== undefined}
		<SectionTitle title="Draft personas">
			<Button slot="buttons" icon={Add} label="Create persona" on:click={createDraft} />
		</SectionTitle>
		<Grid>
			{#each $personas.draft as draftPersona, index}
				<Persona
					name={draftPersona.name}
					description={draftPersona.description}
					postsCount={draftPersona.posts.length}
					on:click={() => goto(ROUTES.PERSONA_DRAFT(index))}
					picture={draftPersona.picture}
				/>
			{/each}
		</Grid>
	{/if}

	{#if $personas.favorite.length !== 0 && $profile.signer !== undefined}
		<SectionTitle title="Favorites" />
		<Grid>
			{#each $personas.favorite as personaId}
				{#if $personas.all.get(personaId) !== undefined}
					<Persona
						name={$personas.all.get(personaId)?.name}
						description={$personas.all.get(personaId)?.description}
						postsCount={$personas.all.get(personaId)?.postsCount ?? 0}
						on:click={() => goto(ROUTES.PERSONA(personaId))}
						picture={$personas.all.get(personaId)?.picture}
					/>
				{/if}
			{/each}
		</Grid>
	{/if}

	<SectionTitle title="All personas">
		<svelte:fragment slot="buttons">
			{#if $profile.signer !== undefined}
				<Button icon={Add} label="Create persona" on:click={createDraft} />
				<Dropdown
					icon={SettingsView}
					options={[
						{
							text: 'Sort by date of creation',
							action: () => console.log('Sort by date of creation'),
						},
						{
							text: 'Sort by recent activity',
							action: () => console.log('Sort by recent activity'),
						},
						{
							text: 'Sort by number of participants',
							action: () => console.log('Sort by number of participants'),
						},
						{
							text: 'Sort by number of posts',
							action: () => console.log('Sort by number of posts'),
						},
						{
							text: 'Sort by name (alphabetical)',
							action: () => console.log('Sort by name (alphabetical)'),
						},
					]}
				/>
				<Dropdown
					icon={sortAsc ? SortAscending : SortDescending}
					options={[
						{ text: 'Ascending order', action: () => (sortAsc = true) },
						{ text: 'Descending order', action: () => (sortAsc = false) },
					]}
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
				description={data.description}
				postsCount={data.postsCount}
				on:click={() => goto(ROUTES.PERSONA(groupId))}
				picture={data.picture}
			/>
		{:else}
			<p>There are no personas yet</p>
		{/each}
	</Grid>
{/if}
