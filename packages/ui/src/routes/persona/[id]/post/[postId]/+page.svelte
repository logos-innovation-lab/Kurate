<script lang="ts">
	import Post from '$lib/components/post.svelte'
	import Loading from '$lib/components/loading.svelte'
	import Button from '$lib/components/button.svelte'
	import ChatBot from '$lib/components/icons/chat-bot.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Header from '$lib/components/header.svelte'
	import Container from '$lib/components/container.svelte'
	import InfoBox from '$lib/components/info-box.svelte'

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
	import { onDestroy, onMount } from 'svelte'

	const postId = $page.params.postId
	const groupId = $page.params.id
	$: personaPosts = $posts.data.get(groupId)
	$: post = personaPosts?.approved.find((p) => p.postId === postId)
	$: persona = $personas.all.get(groupId)
	let draftChat: DraftChat | undefined = undefined

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
	let unsubscribe: () => unknown

	onMount(() => {
		adapter.subscribePersonaPosts(groupId).then((unsub) => (unsubscribe = unsub))
	})

	onDestroy(() => {
		if (unsubscribe) unsubscribe()
	})

	let y: number

	export let onBack: () => unknown = () => history.back()
</script>

<svelte:window bind:scrollY={y} />
	
{#if $personas.loading || personaPosts?.loading}
	<Loading title="Loading post" fullPage>
		<svelte:fragment slot="title">
			Loading post
		</svelte:fragment>
		<svelte:fragment slot="buttons">
			<Button label="Cancel" icon={Close} on:click={() => history.back()} />
		</svelte:fragment>
	</Loading>
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
{:else}
	<Header title="Post" {onBack} />
	<!-- TODO: This is the post page so I'm thinking there shouldn't be an action on the post -->
	<Post {post} on:click noHover />
	<div class="center">
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
	</div>
{/if}

<style lang="scss">
	.center {
		display: flex;
		justify-content: center;
	}
</style>
