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

	let filterText = ''
</script>

<div>
	<HeaderTop address={$profile.address} />

	<div class="wrapper">
		{#if $profile.signer !== undefined}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div>
				<div>Personas</div>
				<div>Chats</div>
			</div>
		{/if}

		<div class="subtitle">All personas</div>
		<Search />
		<input bind:value={filterText} placeholder="Search..." />
		<Button icon={SettingsView} />

		{#if $personas.loading}
			<p>Loading personas...</p>
		{:else if $personas.personas.size === 0}
			<p>There are no personas yet</p>
		{:else}
			<div class="grid">
				{#each [...$personas.personas].filter( ([name]) => name.includes(filterText), ) as [name, data]}
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

	.grid {
		display: grid;
		grid-auto-columns: auto;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		grid-auto-rows: auto;
	}
</style>
