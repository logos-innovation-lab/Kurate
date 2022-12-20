<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Logout from '$lib/components/icons/logout.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import Input from '$lib/components/input.svelte'
	import { canConnect, profile } from '$lib/stores/profile'
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
	{#if !canConnect()}
		<span>Your browser does not have web3 wallet access.</span>
	{:else if $profile.signer === undefined}
		<Button
			variant="primary"
			icon={Wallet}
			label="Connect wallet to post"
			on:click={() => profile.getSigner()}
		/>
		<span>Connect a wallet to access or create your account.</span>
		{#if $profile.error !== undefined}
			<span>Failed to connect {$profile.error.message}</span>
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
