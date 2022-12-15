<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Logout from '$lib/components/icons/logout.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import Input from '$lib/components/input.svelte'
	import { profile } from '$lib/stores/profile'
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
		on:click={() => ($profile.key = undefined)}
		disabled={!$profile.key}
	/>
</div>
<div class="content">
	{#if $profile.key?.publicKey === undefined}
		<Button
			variant="primary"
			icon={Wallet}
			label="Connect wallet to post"
			on:click={() => ($profile.key = { publicKey: '0x90b1c0A1EeF1fe519AeE75D2Ee04855219923f26' })}
		/>
		<span>Connect a wallet to access or create your account.</span>
	{:else}
		<span>Wallet & Identity</span>
		<Input title="Connected wallet">
			<span>{$profile.key.publicKey}</span>
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
