<script lang="ts">
	import { goto } from '$app/navigation'
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import CodeSigningService from '$lib/components/icons/code-signing-service.svelte'
	import GroupSecurity from '$lib/components/icons/group-security.svelte'
	import Identity from '$lib/components/identity.svelte'
	import { ROUTES } from '$lib/routes'
	import { profile } from '$lib/stores/profile'
	import type { User } from '$lib/stores/user'

	const onSelectIdentityClick = (id: User) => {
		$profile.active = id
		history.back()
	}
</script>

<div class="header">
	<h1>{$profile.key ? 'Choose' : 'Create'} identity</h1>
	<Button icon={Close} on:click={() => history.back()} />
</div>
<div class="content">
	{#if $profile.key}
		{#each $profile.profiles as p}
			<Identity identity={p} click={onSelectIdentityClick} />
		{/each}
		<Button
			icon={GroupSecurity}
			label="Create new identity"
			on:click={() => goto(ROUTES.IDENTITY_NEW)}
		/>
		<span>You can create multiple identities under the same account.</span>
		<a href="/">Learn more about identities.</a>
	{:else}
		<div class="icon">
			<GroupSecurity size={200} />
		</div>
		<Button
			variant="primary"
			icon={CodeSigningService}
			label="Generate new keypair"
			on:click={() => {
				$profile.key = { publicKey: '0x90b1c0A1EeF1fe519AeE75D2Ee04855219923f26' }
			}}
		/>
		<span
			>You need to generate a new address to be associated with your identity. This address will
			different that your account address.</span
		>
	{/if}
</div>

<style lang="scss">
	.header {
		left: 0;
		right: 0;
		top: 0;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.icon :global(svg) {
		fill: grey;
	}
</style>
