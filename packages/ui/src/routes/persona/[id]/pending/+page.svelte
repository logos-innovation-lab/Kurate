<script lang="ts">
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import ThumbsDown from '$lib/components/icons/thumbs-down.svelte'
	import Favorite from '$lib/components/icons/favorite.svelte'
	import FavoriteFilled from '$lib/components/icons/favorite-filled.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'
	import Info from '$lib/components/icons/information.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'

	import Grid from '$lib/components/grid.svelte'
	import Header from '$lib/components/header.svelte'
	import Container from '$lib/components/container.svelte'
	import InfoBox from '$lib/components/info-box.svelte'
	import Banner from '$lib/components/message-banner.svelte'
	import SingleColumn from '$lib/components/single-column.svelte'

	import { posts } from '$lib/stores/post'
	import { personas } from '$lib/stores/persona'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'
	import adapter from '$lib/adapters'
	import { canConnectWallet } from '$lib/services'
	import { onDestroy, onMount } from 'svelte'
	import SectionTitle from '$lib/components/section-title.svelte'
	import Dropdown from '$lib/components/dropdown.svelte'
	import DropdownItem from '$lib/components/dropdown-item.svelte'
	import Search from '$lib/components/search.svelte'
	import { tokens } from '$lib/stores/tokens'
	import { VOTE_GO_PRICE } from '$lib/constants'
	import InfoScreen from '$lib/components/info_screen.svelte'
	import LearnMore from '$lib/components/learn-more.svelte'
	import TokenInfo from '$lib/components/token-info.svelte'

	const groupId = $page.params.id
	const persona = $personas.all.get(groupId)
	let personaPosts = $posts.data.get(groupId)
	let sortAsc = true
	let sortBy: 'date' | 'alphabetical' = 'date'
	let filterQuery = ''
	let unsubscribe: () => unknown

	type Vote = {
		index: number
		vote: '+' | '-'
	}

	let vote: Vote | undefined = undefined

	onMount(() => {
		adapter.subscribePersonaPosts(groupId).then((unsub) => (unsubscribe = unsub))
	})

	onDestroy(() => {
		if (unsubscribe) unsubscribe()
	})

	let y: number

	$: personaPosts = $posts.data.get(groupId)
</script>

<svelte:window bind:scrollY={y} />

{#if persona === undefined}
	<Container>
		<InfoBox>
			<div>There is no persona with group ID {groupId}</div>
		</InfoBox>
	</Container>
{:else if vote !== undefined && $tokens.go >= VOTE_GO_PRICE}
	<InfoScreen title={vote.vote === '+' ? 'Promote' : 'Demote'} onBack={() => (vote = undefined)}>
		<SingleColumn>
			<InfoBox>
				<div class="icon">
					<Info size={32} />
				</div>
				<h2>This will use {VOTE_GO_PRICE} GO.</h2>
				<p>
					You will earn REP if the majority of the community also votes to {vote.vote === '+'
						? 'promote'
						: 'demote'} this content.
				</p>
				<p><LearnMore href="/" /></p>
			</InfoBox>
			<TokenInfo
				title="Currently available"
				amount={$tokens.go.toFixed()}
				tokenName="GO"
				explanation="Until new cycle begins"
			/>
		</SingleColumn>
		<svelte:fragment slot="buttons">
			<Button
				label="I agree"
				variant="primary"
				icon={Checkmark}
				on:click={async () => {
					if (!vote || !$profile.signer) return
					await adapter.voteOnPost(groupId, vote.index, vote.vote, $profile.signer)
					vote = undefined
				}}
			/>
			<Button label="Nope" icon={Close} on:click={() => (vote = undefined)} />
		</svelte:fragment>
	</InfoScreen>
{:else if vote !== undefined}
	<InfoScreen title="Not enough token" onBack={() => (vote = undefined)}>
		<SingleColumn>
			<InfoBox>
				<div class="icon">
					<Info size={32} />
				</div>
				<h2>Sorry, you can't vote now.</h2>
				<p>
					You need {VOTE_GO_PRICE} GO to promote or demote content.
				</p>
				<p><LearnMore href="/" /></p>
			</InfoBox>
			<TokenInfo
				title="Currently available"
				amount={$tokens.go.toFixed()}
				tokenName="GO"
				explanation="Until new cycle begins"
				error
			/>
		</SingleColumn>
		<svelte:fragment slot="buttons">
			<Button
				label="I agree"
				variant="primary"
				icon={Checkmark}
				on:click={() => {
					if (!vote || !$profile.signer) return
					adapter.voteOnPost(groupId, vote.index, vote.vote, $profile.signer)
					vote = undefined
				}}
			/>
			<Button label="Nope" icon={Close} on:click={() => (vote = undefined)} />
		</svelte:fragment>
	</InfoScreen>
{:else}
	{#if $tokens.go > 0}
		<Banner icon={Info}>{$tokens.go} GO left in this cycle</Banner>
	{:else}
		<Banner icon={Info} variant="danger">No GO left in this cycle</Banner>
	{/if}
	<div class={`header ${y > 0 ? 'scrolled' : ''}`}>
		<Header title={`Pending • ${persona.name}`} onBack={() => history.back()}>
			{#if $profile.signer !== undefined}
				<Button variant="primary" icon={Edit} on:click={() => goto(ROUTES.POST_NEW(groupId))} />
			{:else}
				<Button
					variant="primary"
					icon={Wallet}
					on:click={adapter.signIn}
					disabled={!canConnectWallet()}
				/>
			{/if}
		</Header>
	</div>
	<SingleColumn>
		<InfoBox>
			<div class="icon">
				<Info size={32} />
			</div>
			<h2>The following are pending posts from anonymous contributors like you.</h2>
			<p>
				Please vote on whether they should be promoted to {persona.name}'s timeline, or demoted into
				oblivion. Voting costs you {VOTE_GO_PRICE} GO, and you may use up to your daily limit. Voting
				in line with the majority earns you REP.
			</p>
			<svelte:fragment slot="buttons">
				{#if $profile.signer !== undefined}
					<Button
						variant="primary"
						label="Submit post"
						icon={Edit}
						on:click={() => goto(ROUTES.POST_NEW(groupId))}
					/>
				{:else}
					<Button
						variant="primary"
						label="Connect to post"
						icon={Wallet}
						on:click={adapter.signIn}
						disabled={!canConnectWallet()}
					/>
				{/if}
			</svelte:fragment>
		</InfoBox>
	</SingleColumn>

	<SectionTitle title="All pending posts">
		<svelte:fragment slot="buttons">
			{#if $profile.signer !== undefined}
				<Dropdown>
					<Button slot="button" icon={SettingsView} />

					<DropdownItem active={sortBy === 'date'} onClick={() => (sortBy = 'date')}>
						Sort by date of creation
					</DropdownItem>
					<DropdownItem
						active={sortBy === 'alphabetical'}
						onClick={() => (sortBy = 'alphabetical')}
					>
						Sort by name (alphabetical)
					</DropdownItem>
				</Dropdown>
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

	{#if !personaPosts || personaPosts.loading}
		<Container>
			<InfoBox>
				<p>Loading posts...</p>
			</InfoBox>
		</Container>
	{:else if personaPosts.pending.length === 0}
		<Container>
			<InfoBox>
				<p>There are no posts yet</p>
			</InfoBox>
		</Container>
	{:else}
		<Grid>
			{#each personaPosts.pending as post, index}
				<Post {post} on:click={() => goto(ROUTES.PERSONA_POST(groupId, index))}>
					{#if post.yourVote === '+' && $profile.signer !== undefined}
						<Button icon={FavoriteFilled} variant="accent" label="You promoted this" />
					{:else if post.yourVote === '-' && $profile.signer !== undefined}
						<Button icon={ThumbsDown} variant="accent" label="You demoted this" />
					{:else}
						<Button
							variant="secondary"
							label="Promote"
							icon={Favorite}
							disabled={$profile.signer === undefined}
							on:click={() => (vote = { index, vote: '+' })}
						/>
						<Button
							variant="secondary"
							label="Demote"
							icon={ThumbsDown}
							disabled={$profile.signer === undefined}
							on:click={() => (vote = { index, vote: '-' })}
						/>
					{/if}
				</Post>
			{/each}
		</Grid>
	{/if}
{/if}

<style lang="scss">
	.header {
		z-index: 50;
		transition: inset 0.5s;

		&.scrolled {
			position: fixed;
			inset: 44px 0 auto;
			transition: inset 0.3s;
		}
	}
</style>
