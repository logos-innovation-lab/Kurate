<script lang="ts">
	import HeaderTop from '$lib/components/header-top.svelte'
	import HeaderDescription from '$lib/components/header-description.svelte'
	import Persona from '$lib/components/persona.svelte'
	import Masonry from '$lib/masonry.svelte'

	import { profile } from '$lib/stores/profile'
	import { personas } from '$lib/stores/persona'

	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import { ROUTES } from '$lib/routes'

	let windowWidth: number = browser ? window.innerWidth : 0

	function getMasonryColumnWidth(windowInnerWidth: number) {
		if (windowInnerWidth < 739) return '100%'
		if (windowInnerWidth < 1060) return 'minmax(min(100%/2, max(320px, 100%/2)), 1fr)'
		if (windowInnerWidth < 1381) return 'minmax(min(100%/3, max(320px, 100%/3)), 1fr)'
		if (windowInnerWidth < 1702) return 'minmax(min(100%/4, max(320px, 100%/4)), 1fr)'
		if (windowInnerWidth < 2023) return 'minmax(min(100%/5, max(320px, 100%/5)), 1fr)'
		if (windowInnerWidth < 2560) return 'minmax(min(100%/6, max(320px, 100%/6)), 1fr)'
		if (windowInnerWidth < 3009) return 'minmax(min(100%/7, max(320px, 100%/7)), 1fr)'
		return 'minmax(323px, 1fr)'
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div>
	<HeaderTop address={$profile.address} />
	<HeaderDescription />

	<div class="wrapper">
		{#if $profile.signer !== undefined}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div>
				<div>Personas</div>
				<div>Chats</div>
			</div>
		{/if}

		{#if $personas.loading}
			<p>Loading personas...</p>
		{:else if $personas.personas.size === 0}
			<p>There are no personas yet</p>
		{:else}
			<!--  FIXME: figure out how to iterate over map with svelte and get rid of this uggly thing [...$personas.personas.entries()] -->
			<Masonry
				gridGap="0"
				colWidth={getMasonryColumnWidth(windowWidth)}
				items={[...$personas.personas.entries()]}
			>
				{#each [...$personas.personas.entries()] as [name, data]}
					<Persona
						{name}
						description={data.description}
						postsCount={data.postsCount}
						on:click={() => goto(ROUTES.PERSONA(name))}
					/>
				{/each}
			</Masonry>
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
</style>
