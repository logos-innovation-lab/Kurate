<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Logout from '$lib/components/icons/logout.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import WalletInfo from '$lib/components/wallet-info.svelte'
	import { profile } from '$lib/stores/profile'
	import { formatAddress } from '$lib/utils'
</script>

<div class="header">
	<div>
		<Button icon={Undo} on:click={() => history.back()} />
		<h1>Account</h1>
	</div>
</div>
<div class="content">
	{#if $profile.key?.publicKey === undefined}
		<div class="wallet-icon-wrapper">
			<Wallet size={192} />
		</div>
		<div class="pad">
			<Button
				variant="primary"
				icon={Wallet}
				label="Connect wallet to post"
				on:click={() =>
					($profile.key = { publicKey: '0x90b1c0A1EeF1fe519AeE75D2Ee04855219923f26' })}
			/>
			<span class="connect-info">Connect a wallet to access or create your account.</span>
		</div>
	{:else}
		<!-- WHY IS THIS AN INPUT? DOES IT HAVE TO BE? -->
		<div class="wallet-info-wrapper">
			<WalletInfo title="Connected wallet">
				<span>{formatAddress($profile.key.publicKey, 8)}</span>
			</WalletInfo>
		</div>
		<div class="pad">
			<Button
				variant="primary"
				icon={Logout}
				label="Logout"
				on:click={() => ($profile.key = undefined)}
				disabled={!$profile.key}
			/>
		</div>
	{/if}
</div>

<style lang="scss">
	.wallet-icon-wrapper :global(svg) {
		fill: var(--grey-100);
	}

	.header {
		padding: var(--spacing-12) var(--spacing-12) 0;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		> div:first-child {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: var(--spacing-12);

			h1 {
				font-weight: 600;
			}
		}
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;

		.pad {
			padding: var(--spacing-12);
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		> div:first-child {
			margin-top: var(--spacing-48);
			margin-bottom: var(--spacing-24);
		}

		.wallet-info-wrapper {
			background-color: var(--grey-100);
			width: 100%;
		}

		.connect-info {
			margin-top: var(--spacing-12);
			text-align: center;
		}
	}
</style>
