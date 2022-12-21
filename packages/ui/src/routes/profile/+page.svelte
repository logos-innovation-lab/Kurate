<script lang="ts">
	import { browser } from '$app/environment'
	import Button from '$lib/components/button.svelte'
	import Logout from '$lib/components/icons/logout.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import Input from '$lib/components/input.svelte'
	import { connectWallet, canConnectWallet, createIdentity } from '$lib/services'
	import { profile } from '$lib/stores/profile'

	let error: Error | undefined = undefined
	let hasWallet = browser && canConnectWallet()

	const handleConnect = async () => {
		try {
			$profile.signer = await connectWallet()

			const defaultIdentity = 'anonymous'

			const identity = await createIdentity($profile.signer, defaultIdentity)

			$profile.identities = { ...$profile.identities, [defaultIdentity]: identity }
		} catch (err) {
			error = err as Error
		}
	}

	$: console.log($profile.identities)
</script>

<div class="header">
	<div>
		<Button icon={Undo} on:click={() => history.back()} />
		<h1>Account</h1>
	</div>
	<Button
		variant="primary"
		icon={Logout}
		label="Logout"
		on:click={() => ($profile.signer = undefined)}
		disabled={!$profile.signer}
	/>
</div>
<div class="content">
	{#if !hasWallet}
		<span>Your browser does not have web3 wallet access.</span>
	{:else if $profile.signer === undefined}
		<Button
			variant="primary"
			icon={Wallet}
			label="Connect wallet to post"
			on:click={handleConnect}
		/>
		<span>Connect a wallet to access or create your account.</span>
		{#if error !== undefined}
			<span>Failed to connect {error.message}</span>
		{/if}
	{:else}
		<span>Wallet & Identity</span>
		<Input title="Connected wallet">
			<span>
				{#await $profile.signer.getAddress()}
					loading...
				{:then address}
					{address}
				{:catch error}
					{error.message}
				{/await}
			</span>
		</Input>
	{/if}

	{#each Object.entries($profile.identities) as [name, identity]}
		<div>{name}</div>
		<div>commitment: {identity.getCommitment().toString(16)}</div>
		<div>nullifier: {identity.getNullifier().toString(16)}</div>
		<div>trapdoor: {identity.getTrapdoor().toString(16)}</div>
	{/each}
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
</style>
