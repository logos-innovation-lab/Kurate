<script lang="ts">
	import Post from '$lib/components/post.svelte'
	import Button from '$lib/components/button.svelte'
	import ChatBot from '$lib/components/icons/chat-bot.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import Header from '$lib/components/header.svelte'
	import Container from '$lib/components/container.svelte'
	import InfoBox from '$lib/components/info-box.svelte'

	import { posts } from '$lib/stores/post'
	import { profile } from '$lib/stores/profile'
	import { chats } from '$lib/stores/chat'
	import { personas } from '$lib/stores/persona'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'
	import adapter from '$lib/adapters'
	import { canConnectWallet } from '$lib/services'

	const post = $posts.data.get($page.params.id)?.approved[$page.params.postId as unknown as number]
	const persona = $personas.all.get($page.params.id)

	const startChat = async () => {
		if (!persona || !post) return

		// FIXME: this should start chat with this post as first post
		$chats.draft = {
			persona,
			post,
			messages: [],
			closed: false,
		}

		goto(ROUTES.CHAT_NEW)
	}

	let y: number

	export let onBack: () => unknown = () => history.back()
</script>

<svelte:window bind:scrollY={y} />

{#if post === undefined}
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
{:else}
	<Header title="Post" {onBack} />
	<Post {post} on:click />

	<div class="center">
		{#if $profile.signer !== undefined}
			<Button variant="primary" label="Chat with poster" icon={ChatBot} on:click={startChat} />
		{:else}
			<Button
				variant="primary"
				icon={Wallet}
				on:click={adapter.signIn}
				disabled={!canConnectWallet()}
			/>
		{/if}
	</div>
{/if}

<style lang="scss">
	.center {
		display: flex;
		justify-content: center;
	}
</style>
