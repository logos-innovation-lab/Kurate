<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Header from '$lib/components/header.svelte'
	import Logout from '$lib/components/icons/logout.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'
	import Divider from '$lib/components/divider.svelte'
	import { formatAddress, formatDateAndTime, formatEpoch } from '$lib/utils/format'
	import { canConnectWallet } from '$lib/services'
	import { profile } from '$lib/stores/profile'
	import adapter from '$lib/adapters'
	import { tokens } from '$lib/stores/tokens'
	import LearnMore from '$lib/components/learn-more.svelte'
	import TokenInfo from '$lib/components/token-info.svelte'
	import SectionTitle from '$lib/components/section-title.svelte'
	import Search from '$lib/components/search.svelte'
	import { transaction } from '$lib/stores/transaction'
	import { ROUTES } from '$lib/routes'
	import { personas } from '$lib/stores/persona'
	import ProgressCircular from '$lib/components/progress-circular.svelte'
	import ProgressLinear from '$lib/components/progress-linear.svelte'
	import Graph from '$lib/components/graph.svelte'

	let y: number

	let error: Error | undefined = undefined

	let filterQuery = ''
	let sortAsc = true

	let cycleProgress = ($tokens.repTotal - $tokens.repStaked) / $tokens.repTotal
	$: cycleProgress = ($tokens.repTotal - $tokens.repStaked) / $tokens.repTotal
</script>

<svelte:window bind:scrollY={y} />

<Header title="Account" onBack={() => history.back()}>
	<Button
		variant="primary"
		icon={Logout}
		label="Logout"
		on:click={() => ($profile = {})}
		disabled={!$profile.signer}
	/>
</Header>
<Divider />
<div class="content">
	{#if $profile.signer === undefined}
		<div class="wallet-icon-wrapper">
			<Wallet size={192} />
		</div>
		<div class="pad">
			<Button
				variant="primary"
				icon={Wallet}
				label="Connect wallet"
				on:click={adapter.signIn}
				disabled={!canConnectWallet()}
			/>
			<span class="connect-info">
				{#if canConnectWallet()}
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
		<h2>Connected wallet</h2>
		<div class="wallet-info-wrapper">
			{#await $profile.signer.getAddress()}
				loading...
			{:then address}
				{formatAddress(address)}
			{:catch error}
				{error.message}
			{/await}
		</div>
		<Divider />
		<h2>Cycle data</h2>
		<div>
			<h3>Current cycle</h3>
			<ProgressCircular progress={$tokens.timeToEpoch / $tokens.epochDuration} />
			<div>{formatEpoch($tokens.timeToEpoch)} left in this cycle</div>
			<LearnMore />
			<div class="side-by-side">
				<TokenInfo
					title="Total reputation"
					amount={$tokens.repTotal.toFixed()}
					tokenName="REP"
					explanation={`Including staked`}
				/>
				<TokenInfo
					title="Currently available"
					amount={$tokens.go.toFixed()}
					tokenName="GO"
					explanation="Until new cycle begins"
				/>
			</div>
		</div>
		<div>
			<h2>Staked reputation</h2>
			<ProgressLinear progress={cycleProgress} />
			<p>
				{$tokens.repTotal - $tokens.repStaked} out of {$tokens.repTotal} REP staked until cycle ends
			</p>
			<LearnMore />
		</div>
		<div>
			<h2>Reputation over time</h2>
			<Graph minX={0} maxX={100} minY={0} maxY={0} values={$tokens.repTotalHistoricalValues} />
			<LearnMore />
		</div>
		<Divider />
		<SectionTitle title="Activity">
			<svelte:fragment slot="buttons">
				{#if $profile.signer !== undefined}
					<Button
						icon={sortAsc ? SortAscending : SortDescending}
						on:click={() => (sortAsc = !sortAsc)}
					/>
				{/if}
			</svelte:fragment>
			{#if $profile.signer !== undefined}
				<Search bind:filterQuery />
			{/if}
		</SectionTitle>
		{#each $transaction.transactions.sort( (a, b) => (sortAsc ? b.timestamp - a.timestamp : a.timestamp - b.timestamp), ) as t}
			<div>
				{#if t.goChange !== 0}
					<h2>{t.goChange} GO</h2>
					<div>
						{#if t.type === 'publish persona'}
							You created persona <a href={ROUTES.PERSONA(t.personaId)}
								>{$personas.all.get(t.personaId)?.name}</a
							>
						{:else}
							You {#if t.type === 'promote'}
								promoted a post on
							{:else if t.type === 'demote'}
								demoted a post on
							{:else if t.type === 'publish post'}
								submitted a post to
							{/if}
							<a href={ROUTES.PERSONA_PENDING(t.personaId)}
								>Pending • {$personas.all.get(t.personaId)?.name}</a
							>
						{/if}
						<div>{formatDateAndTime(t.timestamp)}</div>
					</div>
				{/if}
				{#if t.repChange !== 0}
					<h2>Staked {t.repChange} REP</h2>
					<div>
						You submitted a post to <a href={ROUTES.PERSONA_PENDING(t.personaId)}
							>Pending • {$personas.all.get(t.personaId)?.name}</a
						>
						<div>{formatDateAndTime(t.timestamp)}</div>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.wallet-icon-wrapper :global(svg) {
		fill: var(--grey-100);

		@media (prefers-color-scheme: dark) {
			fill: var(--grey-500);
		}
	}

	.side-by-side {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: center;
		gap: var(--spacing-6);
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: --var(--spacing-48);

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
</style>
