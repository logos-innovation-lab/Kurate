<script lang="ts">
	import HeaderTop from '$lib/components/header-top.svelte'
	import Persona from '$lib/components/persona.svelte'
	import Grid from '$lib/components/grid.svelte'

	import { profile } from '$lib/stores/profile'
	import { personas } from '$lib/stores/persona'
	import { chats } from '$lib/stores/chat'

	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'

	import Button from '$lib/components/button.svelte'
	import Search from '$lib/components/icons/search.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import Add from '$lib/components/icons/add.svelte'

	let filterText = ''
	let showChat = false

	function createDraft() {
		const index = $personas.draft.length
		personas.addDraft({ posts: [] })
		goto(ROUTES.PERSONA_DRAFT(index))
	}
</script>

<div>
	<HeaderTop address={$profile.address} />

	<div class="wrapper">
		{#if $profile.signer !== undefined}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="nav-wrapper">
				<nav class={showChat ? 'chats' : ''}>
					<div class={showChat ? '' : 'active'} on:click={() => (showChat = false)}>Personas</div>
					<div class={showChat ? 'active' : ''} on:click={() => (showChat = true)}>
						Chats
						{#if $chats.unread > 0}
							<div class="unread">{$chats.unread}</div>
						{/if}
					</div>
				</nav>
			</div>
		{/if}

		{#if showChat}
			<div>Chat not implemented yet</div>
		{:else if $personas.loading}
			<p>Loading personas...</p>
		{:else}
			{#if $personas.draft?.length !== 0 && $profile.signer !== undefined}
				<div class="section-wrapper">
					<div class="subtitle">Draft personas</div>
					<hr />
					<Button icon={Add} label="Create persona" on:click={createDraft} />
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

			{#if $personas.favorite.size !== 0 && $profile.signer !== undefined}
				<div class="section-wrapper">
					<div class="subtitle">Favorites</div>
					<hr />
					<Grid>
						{#each [...$personas.favorite] as [name, data]}
							<Persona
								{name}
								description={data.description}
								postsCount={data.postsCount}
								on:click={() => goto(ROUTES.PERSONA(name))}
								picture={data.picture}
							/>
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
	</div>
</div>

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
	}
	.subtitle {
		padding: var(--spacing-24);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-sb);

		transition: padding 0.2s;
		max-width: 498px;
		margin-inline: auto;

		@media (min-width: 688px) {
			max-width: 996px;
			transition: padding 0.2s;
			padding-inline: var(--spacing-48);
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

	nav {
		width: 100%;
		max-width: 450px;
		height: 50px;
		margin: auto;
		border-radius: 25px;
		background-color: var(--grey-200);
		display: flex;
		align-items: center;
		font-family: var(--font-body);
		font-size: var(--font-size-normal);
		font-weight: var(--font-weight-sb);
		border: solid 3px var(--grey-200);
		position: relative;

		@media (prefers-color-scheme: dark) {
			background-color: var(--grey-500);
			border-color: var(--grey-500);
		}

		&::before {
			content: '';
			position: absolute;
			inset: 0 50% 0 0;
			background-color: var(--color-body-bg);
			padding: 10px;
			border-radius: 25px;
			z-index: 0;
			transition: inset 0.3s;
		}

		&.chats::before {
			inset: 0 0 0 50%;
			transition: inset 0.3s;
		}

		div {
			padding: 10px;
			width: 50%;
			border-radius: 25px;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			z-index: 10;
		}

		.unread {
			background-color: var(--color-body-text);
			color: var(--color-body-bg);
			width: fit-content;
			height: 20px;
			padding: 0 7px;
			margin-left: var(--spacing-6);
			font-size: var(--font-size-xs);
			font-weight: var(--font-weight-sb);
			line-height: 20px;
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
