<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Loading from '$lib/components/loading.svelte'
	import Header from '$lib/components/header.svelte'
	import Logout from '$lib/components/icons/logout.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'
	import Divider from '$lib/components/divider.svelte'
	import { formatDateAndTime, formatEpoch } from '$lib/utils/format'
	import { canConnectWallet } from '$lib/services'
	import { profile } from '$lib/stores/profile'
	import adapter from '$lib/adapters'
	import { tokens } from '$lib/stores/tokens'
	import LearnMore from '$lib/components/learn-more.svelte'
	import BorderBox from '$lib/components/border-box.svelte'
	import SectionTitle from '$lib/components/section-title.svelte'
	import Search from '$lib/components/search.svelte'
	import { transaction } from '$lib/stores/transaction'
	import { ROUTES } from '$lib/routes'
	import { personas } from '$lib/stores/persona'
	import ProgressCircular from '$lib/components/progress-circular.svelte'
	import ProgressLinear from '$lib/components/progress-linear.svelte'
	import SingleColumn from '$lib/components/single-column.svelte'
	import Spacer from '$lib/components/spacer.svelte'

	let y: number

	let error: Error | undefined = undefined

	let filterQuery = ''
	let sortAsc = true
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
		<SingleColumn>
			<div class="wallet-info">
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
			</div>
		</SingleColumn>
	{:else}
		<SingleColumn>
			<div class="wallet-info">
				<h2>Wallet address</h2>
				<div class="wallet-info-wrapper">
					{#await $profile.signer.getAddress()}
						<Loading>
							<svelte:fragment slot="title">Loading address</svelte:fragment>
						</Loading>
					{:then address}
						{address}
					{:catch error}
						{error.message}
					{/await}
				</div>
			</div>
		</SingleColumn>
		<Divider />
		<SingleColumn>
			<h2 class="cycle-data">Cycle data</h2>
			<BorderBox noGap title="Current cycle">
				<ProgressCircular progress={$tokens.timeToEpoch / $tokens.epochDuration} />
				<div class="spacing-top">{formatEpoch($tokens.timeToEpoch)} left in this cycle</div>
				<LearnMore href="https://kurate-faq.vercel.app/token%20mechanics/what-is-a-cycle" />
			</BorderBox>
			<div class="side-by-side">
				<BorderBox
					noGap
					title="Total reputation"
					amount={$tokens.repTotal.toFixed()}
					tokenName="REP"
					explanation={`Including staked`}
				/>
				<BorderBox
					noGap
					title="Currently available"
					amount={$tokens.go.toFixed()}
					tokenName="GO"
					explanation="Until new cycle begins"
				/>
			</div>
			<BorderBox noGap title="Staked reputation">
				<ProgressLinear progress={$tokens.repStaked / $tokens.repTotal} />
				<p class="spacing-top">
					{$tokens.repStaked} out of {$tokens.repTotal} REP staked until cycle ends
				</p>
			</BorderBox>
		</SingleColumn>
		<Spacer />
		<Divider />
		<SingleColumn>
			<div class="filter">
				<SectionTitle title="Activity" noDivider noPad>
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
			</div>
		</SingleColumn>
		<SingleColumn>
			<div class="activity">
				{#each $transaction.transactions.sort( (a, b) => (sortAsc ? b.timestamp - a.timestamp : a.timestamp - b.timestamp), ) as t}
					{#if t.goChange !== 0}
						<div class="activity-item">
							<h2>{t.goChange} GO</h2>
							<div class="description">
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
							</div>
							<div class="timestamp">{formatDateAndTime(t.timestamp)}</div>
						</div>
					{/if}

					{#if t.repChange !== 0}
						<div class="activity-item">
							<h2>Staked {t.repChange} REP</h2>
							<div class="description">
								You submitted a post to <a href={ROUTES.PERSONA_PENDING(t.personaId)}
									>Pending • {$personas.all.get(t.personaId)?.name}</a
								>
							</div>
							<div class="timestamp">{formatDateAndTime(t.timestamp)}</div>
						</div>
					{/if}
				{/each}
			</div>
		</SingleColumn>
	{/if}
</div>

<style lang="scss">
	.activity {
		margin-top: 36px;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-48);
		margin-bottom: var(--spacing-48);

		.activity-item {
			display: flex;
			flex-direction: column;
			gap: var(--spacing-6);

			.timestamp {
				font-size: var(--font-size-sm);
			}
		}
	}
	.wallet-icon-wrapper :global(svg) {
		fill: var(--grey-100);

		// @media (prefers-color-scheme: dark) {
		// 	fill: var(--grey-500);
		// }
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

		.wallet-info {
			padding-block: var(--spacing-48);
			display: flex;
			flex-direction: column;
			gap: var(--spacing-12);
		}

		.wallet-info-wrapper {
			background-color: var(--grey-150);
			display: block;
			padding: var(--spacing-12);
			font-family: var(--font-mono);
			word-break: break-all;
		}

		.connect-info {
			margin-top: var(--spacing-12);
			text-align: center;
		}
	}

	.cycle-data {
		margin-top: var(--spacing-48);
		margin-bottom: var(--spacing-12);
	}

	.filter {
		@media (min-width: 688px) {
			padding-top: var(--spacing-24);
		}
	}

	.spacing-top {
		margin-top: var(--spacing-12);
	}
</style>
