<script lang="ts">
	import HeaderTop from '$lib/components/header-top.svelte'
	import Persona from '$lib/components/persona.svelte'

	import { profile } from '$lib/stores/profile'
	import { personas } from '$lib/stores/persona'

	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'

	import Button from '$lib/components/button.svelte'
	import Search from '$lib/components/icons/search.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import Add from '$lib/components/icons/arrow-right.svelte'
	import { chats } from '$lib/stores/chat'

	let filterText = ''
	let showChat = false
</script>

<div>
	<HeaderTop address={$profile.address} />

	<div class="wrapper">
		{#if $profile.signer !== undefined}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="nav">
				<div class={showChat ? '' : 'active'} on:click={() => (showChat = false)}>Personas</div>
				<div class={showChat ? 'active' : ''} on:click={() => (showChat = true)}>
					Chats
					{#if $chats.unread > 0}
						<div class="unread">{$chats.unread}</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if showChat}
			<div>Chat not implemented yet</div>
		{:else if $personas.loading}
			<p>Loading personas...</p>
		{:else}
			{#if $personas.draft.size !== 0 && $profile.signer !== undefined}
				<div class="subtitle">Draft personas</div>
				<div class="grid">
					{#each [...$personas.draft] as [name, data]}
						<Persona
							{name}
							description={data.description}
							postsCount={data.postsCount}
							on:click={() => goto(ROUTES.PERSONA(name))}
							picture={data.picture}
						/>
					{/each}
				</div>
			{/if}

			{#if $personas.favorite.size !== 0 && $profile.signer !== undefined}
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
			{/if}

			<div class="personas-wrap">
				<div class="personas-filter">
					<div class="subtitle">All personas</div>
					<div class="btns">
						{#if $profile.signer !== undefined}
							<Button icon={Add} label="Create persona" />
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
				{#each [...$personas.all].filter(([name]) => name.includes(filterText)) as [name, data]}
					<Persona
						{name}
						description={data.description}
						postsCount={data.postsCount}
						on:click={() => goto(ROUTES.PERSONA(name))}
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
	

	.nav {
		width: 450px;
		height: 50px;
		margin: auto;
		border-radius: 25px;
		background-color: #ececec;
		display: flex;
		align-items: center;
		border: solid 3px #ececec;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 600;

		div {
			padding: 10px;
			width: 50%;
			border-radius: 25px;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
		}

		div.active {
			background-color: white;
		}

		.unread {
			background-color: black;
			color: white;
			width: min-content;
			margin-left: 6px;
			font-size: 12px;
			font-weight: bold;
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
			border-top: 1px solid var(--grey-500);
			border-bottom: 1px solid var(--grey-500);
		}

		.personas-filter {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;			

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
		padding-top: var(--spacing-12);

		@media (min-width: 739px) {
			padding-top: var(--spacing-24);
		}

		input {
			border: none;
			background-color: transparent;
			font-size: 18px;
		}
	}
	}
	
</style>
