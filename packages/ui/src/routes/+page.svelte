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

			<div class="subtitle">All personas</div>
			<Search />
			<input bind:value={filterText} placeholder="Search..." />
			<Button icon={SettingsView} />

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
	.wrapper {
		margin-left: -1px;

		@media (min-width: 739px) {
			padding: 0 var(--spacing-48);
			margin: 0 auto 0;
		}
	}

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
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		grid-auto-rows: auto;
	}
</style>
