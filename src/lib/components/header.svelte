<script lang="ts">
	import UserIcon from '$lib/components/icons/user.svelte'
	import Button from './button.svelte'

	import Avatar from './avatar.svelte'

	import type { User } from '$lib/stores/user'
	import { goto } from '$app/navigation'

	let cls: string | undefined = undefined
	export { cls as class }
	export let user: User | undefined = undefined
</script>

<div class={`root ${cls}`}>
	<div class="header">
		<span class="header-title">The Outlet</span>
		{#if user !== undefined}
			<Avatar src={user.avatar} on:click={() => goto('/profile')} />
		{:else}
			<Button icon={UserIcon} on:click={() => goto('/profile')} />
		{/if}
	</div>
	<div class="header-description">
		Milestone 1 shaman pitchfork typewriter single-origin coffee beard flannel, actually chillwave.
	</div>
	
	<div class="subtitle">Public timeline</div>
</div>

<style lang="scss">

	.root {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		padding: var(--spacing-12);
		border-bottom: 1px solid var(--grey-200);
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(3px);

		@media (prefers-color-scheme: dark) {
			border-bottom-color: var(--grey-500);
		}
		
		// Statement below is conditional to adding class to element via javascript. 
		// I added the class to the element because of the unique class name nature of svelte.
		// Ideally the .scrolled class would be in the body but this doesn't seem feasible. 
		// Check with Vojtech

		&:global(.scrolled) {
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);
		}
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0 var(--spacing-24);
	}
	.header-title {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 18px;
		font-style: normal;
		text-align: left;
	}

	.header-description {
		padding: 0 0 var(--spacing-24);
	}
	.subtitle {
		font-size: 16px;
		font-weight: 600;
		padding: 0;
	}
</style>
