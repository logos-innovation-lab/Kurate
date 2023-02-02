<script lang="ts">
	import { browser } from '$app/environment'
	import Button from '$lib/components/button.svelte'
	import Logout from '$lib/components/icons/logout.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import WalletInfo from '$lib/components/wallet-info.svelte'
	import { formatAddress } from '$lib/utils'
	import {
		connectWallet,
		canConnectWallet,
		createIdentity,
		getGlobalAnonymousFeed,
		getContractGroup,
		joinGroupOffChain,
		joinGroupOnChain,
	} from '$lib/services'
	import { profile } from '$lib/stores/profile'

	let y: number

	let error: Error | undefined = undefined
	let hasWallet = browser && canConnectWallet()

	const handleConnect = async () => {
		try {
			const signer = await connectWallet()
			$profile.signer = signer

			const defaultIdentity = 'anonymous'

			const identity = await createIdentity(signer, defaultIdentity)

			$profile.identities = { ...$profile.identities, [defaultIdentity]: identity }

			const globalAnonymousFeed = getGlobalAnonymousFeed(signer)
			const group = await getContractGroup(globalAnonymousFeed)

			const commitment = identity.commitment

			if (!group.members.includes(commitment)) {
				joinGroupOffChain(group, commitment)
				const txres = await joinGroupOnChain(globalAnonymousFeed, commitment)
				console.log(txres)
			}
		} catch (err) {
			error = err as Error
		}
	}
</script>

<svelte:window bind:scrollY={y} />

<div class={`header ${y > 0 ? 'scrolled' : ''}`}>
	<div>
		<Button icon={Undo} on:click={() => history.back()} />
		<h1>Account</h1>
	</div>
</div>
<div class="content">
	{#if $profile.signer === undefined}
		<div class="wallet-icon-wrapper">
			<Wallet size={192} />
		</div>
		<div class="pad">
			<Button
				variant="primary"
				icon={Wallet}
				label="Connect wallet to post"
				on:click={handleConnect}
				disabled={!hasWallet}
			/>
			<span class="connect-info">
				{#if hasWallet}
					Connect a wallet to access or create your account.
				{:else}
					Please install a web3 wallet to access or create your account.
				{/if}
			</span>
			{#if error !== undefined}
				<span>Failed to connect {error.message}</span>
			{/if}
		</div>
	{:else}
		<div class="wallet-info-wrapper">
			<WalletInfo title="Connected wallet">
				{#await $profile.signer.getAddress()}
					loading...
				{:then address}
					{formatAddress(address)}
				{:catch error}
					{error.message}
				{/await}
			</WalletInfo>
		</div>
		<div class="pad">
			<Button
				variant="primary"
				icon={Logout}
				label="Logout"
				on:click={() => ($profile.signer = undefined)}
				disabled={!$profile.signer}
			/>
		</div>
	{/if}

	<div class="info">
		{#each Object.entries($profile.identities) as [name, identity]}
			<div>{name}</div>
			<div>commitment: {identity.getCommitment().toString(16)}</div>
			<div>nullifier: {identity.getNullifier().toString(16)}</div>
			<div>trapdoor: {identity.getTrapdoor().toString(16)}</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.wallet-icon-wrapper :global(svg) {
		fill: var(--grey-100);

		@media (prefers-color-scheme: dark) {
			fill: var(--grey-500);
		}
	}

	.header {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		padding: var(--spacing-12);
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(3px);
		transition: padding 0.2s;

		@media (min-width: 1280px) {
			border-bottom: none;
			padding-top: var(--spacing-48);
			transition: padding 0.2s;
		}

		&.scrolled {
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);

			@media (min-width: 1280px) {
				padding-top: var(--spacing-12);
				transition: padding 0.2s;
			}
		}

		> div:first-child {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: var(--spacing-12);

			@media (min-width: 1280px) {
				width: 1280px;
				margin: 0 auto;
			}

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
			max-width: 480px;
		}

		.connect-info {
			margin-top: var(--spacing-12);
			text-align: center;
		}
	}
	.info {
		padding: var(--spacing-12);
		max-width: 100%;
		word-wrap: break-word;

		> div:not(:first-child) {
			margin-top: var(--spacing-12);
		}
	}
</style>
