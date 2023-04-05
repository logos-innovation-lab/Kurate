<script lang="ts">
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import ChatBot from '$lib/components/icons/chat-bot.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import ThumbsDown from '$lib/components/icons/thumbs-down.svelte'
	import Favorite from '$lib/components/icons/favorite.svelte'
	import FavoriteFilled from '$lib/components/icons/favorite-filled.svelte'
	import Info from '$lib/components/icons/information.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'

	import Banner from '$lib/components/message-banner.svelte'
	import Header from '$lib/components/header.svelte'
	import Container from '$lib/components/container.svelte'
	import InfoBox from '$lib/components/info-box.svelte'
	import InfoScreen from '$lib/components/info_screen.svelte'
	import SingleColumn from '$lib/components/single-column.svelte'
	import BorderBox from '$lib/components/border-box.svelte'
	import LearnMore from '$lib/components/learn-more.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
	import type { DraftChat } from '$lib/stores/chat'
	import { personas } from '$lib/stores/persona'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'
	import adapter from '$lib/adapters'
	import { canConnectWallet } from '$lib/services'
	import ChatScreen from '$lib/components/chat-screen.svelte'
	import { VOTE_GO_PRICE } from '$lib/constants'
	import { tokens } from '$lib/stores/tokens'
	import { onDestroy, onMount } from 'svelte'

	type Vote = {
		index: string
		vote: '+' | '-'
	}

	let vote: Vote | undefined = undefined
	let unsubscribe: () => unknown

	onMount(() => {
		adapter.subscribePersonaPosts(groupId).then((unsub) => (unsubscribe = unsub))
	})

	onDestroy(() => {
		if (unsubscribe) unsubscribe()
	})

	const postId = $page.params.postId
	const groupId = $page.params.id
	$: personaPosts = $posts.data.get(groupId)
	$: post = personaPosts?.pending.find((p) => p.postId === postId)
	$: persona = $personas.all.get(groupId)
	let draftChat: DraftChat | undefined = undefined

	$: console.log({ persona, post, personaPosts })

	const startChat = async () => {
		if (!persona || !post) return

		draftChat = {
			persona,
			post,
			messages: [],
		}
	}

	async function sendMessage(text: string) {
		if (!draftChat) return
		const chatId = await adapter.startChat(draftChat)
		await adapter.sendChatMessage(chatId, text)
		goto(ROUTES.CHAT(chatId))
	}

	let y: number

	export let onBack: () => unknown = () => history.back()
</script>

<svelte:window bind:scrollY={y} />

{#if $profile.signer !== undefined && $tokens.go > 0}
	<Banner icon={Info}>{$tokens.go} GO left in this cycle</Banner>
{:else if $profile.signer !== undefined}
	<Banner icon={Info} variant="danger">No GO left in this cycle</Banner>
{:else}
	<Banner icon={Info}>Connect to see your GO balance</Banner>
{/if}

{#if $personas.loading || personaPosts?.loading}
	<Container>
		<InfoBox>
			<div>Loading...</div>
		</InfoBox>
	</Container>
{:else if $personas.loading || personaPosts?.error}
	<Container>
		<InfoBox>
			<div>Something went wrong</div>
		</InfoBox>
	</Container>
{:else if post === undefined}
	<Container>
		<InfoBox>
			<div>There is no post with post ID {$page.params.postId}</div>
		</InfoBox>
	</Container>
{:else if persona === undefined}
	<Container>
		<InfoBox>
			<div>There is no persona with ID {$page.params.id}</div>
		</InfoBox>
	</Container>
{:else if draftChat !== undefined}
	<ChatScreen chat={draftChat} {sendMessage} title="New chat" onBack={() => history.back()} />
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
				<p><LearnMore href="https://kurate-faq.vercel.app/curation/earn-rep-by-curating" /></p>
			</InfoBox>
			<BorderBox
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
				<p><LearnMore href="https://kurate-faq.vercel.app/token%20mechanics/what-is-go" /></p>
			</InfoBox>
			<BorderBox
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
	<Header title="Post" {onBack} />
	<!-- TODO: This is the post page so I'm thinking there shouldn't be an action on the post -->
	<Post {post} on:click noHover>
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
				on:click={() => {
					if (post) vote = { index: post.postId, vote: '+' }
				}}
			/>
			<Button
				variant="secondary"
				label="Demote"
				icon={ThumbsDown}
				disabled={$profile.signer === undefined}
				on:click={() => {
					if (post) vote = { index: post.postId, vote: '-' }
				}}
			/>
		{/if}
		{#if $profile.signer === undefined}
			<Button
				variant="primary"
				icon={Wallet}
				on:click={adapter.signIn}
				disabled={!canConnectWallet()}
			/>
		{:else if $profile.signer !== undefined && !post.myPost}
			<Button variant="primary" label="Chat with poster" icon={ChatBot} on:click={startChat} />
		{/if}
	</Post>
{/if}
