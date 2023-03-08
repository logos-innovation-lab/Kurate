<script lang="ts">
	import Search from '$lib/components/icons/search.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import Add from '$lib/components/icons/add.svelte'

	import Persona from '$lib/components/persona.svelte'
	import Grid from '$lib/components/grid.svelte'
	import Button from '$lib/components/button.svelte'
	import Container from '$lib/components/container.svelte'

	import { profile } from '$lib/stores/profile'
	import { personas } from '$lib/stores/persona'

	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'

	let filterText = ''

	function createDraft() {
		goto(ROUTES.PERSONA_NEW)
	}
</script>

{#if $personas.loading}
	<p>Loading personas...</p>
{:else}
	{#if $personas.draft?.length !== 0 && $profile.signer !== undefined}
		<div class="section-wrapper">
			<div class="section-top">
				<Container class="flex">
					<div class="subtitle">Draft personas</div>
					<Button icon={Add} label="Create persona" on:click={createDraft} />
				</Container>
			</div>
			<hr />
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
		</div>
	{/if}

	{#if $personas.favorite.length !== 0 && $profile.signer !== undefined}
		<div class="section-wrapper">
			<div class="section-top">
				<Container>
					<div class="subtitle">Favorites</div>
				</Container>
			</div>
			<hr />
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
		</div>
	{/if}

	<div class={`personas-wrap ${$profile.signer === undefined ? 'border-top' : ''}`}>
		<div>
			<div class="personas-filter">
				<div class="personas-title">All personas</div>
				<div class="btns">
					{#if $profile.signer !== undefined}
						<Button icon={Add} label="Create persona" on:click={createDraft} />
					{/if}
					<Button icon={SettingsView} />
				</div>
			</div>
			<div class="search-field">
				<Search />
				<input bind:value={filterText} placeholder="Search..." />
			</div>
		</div>
	</div>

	<Grid>
		{#each [...$personas.all].filter(([, data]) => data.name
				.toLowerCase()
				.includes(filterText.toLowerCase())) as [groupId, data]}
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

<style lang="scss">
	.nav-wrapper {
		border-bottom: 1px solid var(--grey-200);
		padding: 0 var(--spacing-24) var(--spacing-24);

		@media (prefers-color-scheme: dark) {
			border-bottom-color: var(--grey-500);
		}

		@media (min-width: 688px) {
			padding: 0 var(--spacing-48) var(--spacing-48);
		}
	}

	.section-wrapper {
		@media (min-width: 688px) {
			padding-block: var(--spacing-24);
			border-bottom: 1px solid var(--grey-200);

			@media (prefers-color-scheme: dark) {
				border-bottom-color: var(--grey-500);
			}
		}

		.section-top {
			padding-block: var(--spacing-24);

			:global(.flex) {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
		}
	}
	.subtitle {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-sb);
		transition: padding 0.2s;
		max-width: 498px;

		@media (min-width: 688px) {
			max-width: 996px;
			transition: padding 0.2s;
		}

		@media (min-width: 1242px) {
			max-width: 1494px;
		}

		@media (min-width: 1640px) {
			max-width: 1992px;
		}

		@media (min-width: 2038px) {
			max-width: 2490px;
		}
	}

	hr {
		@media (min-width: 688px) {
			display: none;
		}
	}

	.personas-wrap {
		border-bottom: 1px solid var(--grey-200);
		padding: var(--spacing-24);
		transition: padding 0.2s;

		&.border-top {
			border-top: 1px solid var(--grey-200);
		}

		> div {
			max-width: 450px;
			margin-inline: auto;

			@media (min-width: 688px) {
				max-width: 900px;
				transition: padding 0.2s;
			}

			@media (min-width: 1242px) {
				max-width: 1398px;
			}

			@media (min-width: 1640px) {
				max-width: 1896px;
			}

			@media (min-width: 2038px) {
				max-width: 2394px;
			}
		}

		@media (min-width: 688px) {
			padding: var(--spacing-48) var(--spacing-48) var(--spacing-24);
			border-bottom: none;
		}

		@media (prefers-color-scheme: dark) {
			&.border-top {
				border-top-color: var(--grey-500);
			}
			border-bottom-color: var(--grey-500);
		}

		.personas-filter {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;
			margin-bottom: var(--spacing-12);

			.personas-title {
				border-bottom: none;
			}

			@media (min-width: 688px) {
				margin-bottom: var(--spacing-24);
			}

			.btns {
				display: flex;
				justify-content: space-between;
				align-items: center;
				flex-direction: row;
				flex-wrap: nowrap;
				gap: var(--spacing-12);
			}
		}

		.search-field {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			flex-wrap: nowrap;
			flex-direction: row;
			gap: var(--spacing-12);

			@media (min-width: 688px) {
			}

			input {
				border: none;
				background-color: transparent;
				font-size: var(--font-size-lg);
			}
		}
	}
</style>