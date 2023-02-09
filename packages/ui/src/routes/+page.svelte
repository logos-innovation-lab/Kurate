<script lang="ts">
	import HeaderTop from '$lib/components/header-top.svelte'
	import Persona from '$lib/components/persona.svelte'

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
			{#if $personas.draft.length !== 0 && $profile.signer !== undefined}
				<div class="section-wrapper">
					<div class="subtitle">Draft personas</div>
					<Button icon={Add} label="Create persona" on:click={() => goto(ROUTES.PERSONA_NEW)} />
					<div class="grid">
						{#each $personas.draft as draftPersona, index}
							<Persona
								name={draftPersona.name}
								description={draftPersona.description}
								postsCount={draftPersona.postsCount}
								on:click={() => goto(ROUTES.PERSONA(index.toFixed()))}
								picture={draftPersona.picture}
							/>
						{/each}
					</div>
				</div>
			{/if}

			{#if $personas.favorite.size !== 0 && $profile.signer !== undefined}
				<div class="section-wrapper">
					<div class="subtitle">Favorites</div>
					<div class="grid">
						{#each [...$personas.favorite] as [name, data]}
							<Persona
								{name}
								description={data.description}
								postsCount={data.postsCount}
								on:click={() => goto(ROUTES.PERSONA(name))}
								picture={data.picture}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<div class="personas-wrap">
				<div class="personas-filter">
					<div class="personas-title">All personas</div>
					<div class="btns">
						{#if $profile.signer !== undefined}
							<Button icon={Add} label="Create persona" on:click={() => goto(ROUTES.PERSONA_NEW)} />
						{/if}
						<Button icon={SettingsView} />
					</div>
				</div>
				<div class="search-field">
					<Search />
					<input bind:value={filterText} placeholder="Search..." />
				</div>
			</div>

			<div class="grid">
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
			</div>
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

		@media (min-width: 739px) {
			padding: 0 var(--spacing-48) var(--spacing-48);
		}
	}

	.section-wrapper {
		border-bottom: 1px solid var(--grey-200);

		@media (prefers-color-scheme: dark) {
			border-bottom-color: var(--grey-500);
		}

		@media (min-width: 739px) {
			padding-block: var(--spacing-24);
		}
	}
	.subtitle {
		padding: var(--spacing-24);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-sb);
		border-bottom: 1px solid var(--grey-200);

		@media (prefers-color-scheme: dark) {
			border-bottom-color: var(--grey-500);
		}

		@media (min-width: 739px) {
			padding-inline: var(--spacing-48);
			border-bottom: none;
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
		border-top: 1px solid var(--grey-200);
		border-bottom: 1px solid var(--grey-200);
		padding: var(--spacing-24);
		transition: padding 0.2s;
		@media (min-width: 739px) {
			padding: var(--spacing-48);
			transition: padding 0.2s;
		}

		@media (prefers-color-scheme: dark) {
			border-top-color: var(--grey-500);
			border-bottom-color: var(--grey-500);
		}

		.personas-filter {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;
			padding-bottom: var(--spacing-12);

			.personas-title {
				padding-bottom: var(--spacing-12);
				border-bottom: none;
			}

			@media (min-width: 739px) {
				padding-bottom: var(--spacing-24);
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

			@media (min-width: 739px) {
			}

			input {
				border: none;
				background-color: transparent;
				font-size: var(--font-size-lg);
			}
		}
	}

	.grid {
		display: grid;
		grid-auto-columns: auto;
		grid-template-columns: 100%;
		grid-auto-rows: auto;

		@media (min-width: 739px) {
			padding: 0 var(--spacing-24);
			grid-template-columns: repeat(auto-fit, minmax(min(100%/2, max(320px, 100%/2)), 1fr));
		}

		@media (min-width: 1060px) {
			grid-template-columns: repeat(auto-fit, minmax(min(100%/3, max(320px, 100%/3)), 1fr));
		}

		@media (min-width: 1381px) {
			grid-template-columns: repeat(auto-fit, minmax(min(100%/4, max(320px, 100%/4)), 1fr));
		}

		@media (min-width: 1702px) {
			grid-template-columns: repeat(auto-fit, minmax(min(100%/5, max(320px, 100%/5)), 1fr));
		}

		@media (min-width: 2023px) {
			grid-template-columns: repeat(auto-fit, minmax(min(100%/6, max(320px, 100%/6)), 1fr));
		}

		@media (min-width: 2560px) {
			grid-template-columns: repeat(auto-fit, minmax(min(100%/7, max(320px, 100%/7)), 1fr));
		}

		@media (min-width: 3009px) {
			grid-template-columns: repeat(auto-fit, minmax(min(100%/9, max(320px, 100%/9)), 1fr));
		}
	}

	.grid {
		display: grid;
		grid-auto-columns: auto;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		grid-auto-rows: auto;
	}
</style>
