<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	import adapter from '$lib/adapters'

	import ChatScreen from '$lib/components/chat-screen.svelte'
	import Container from '$lib/components/container.svelte'
	import Loading from '$lib/components/loading.svelte'
	import InfoBox from '$lib/components/info-box.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'

	import { ROUTES } from '$lib/routes'
	import { chats } from '$lib/stores/chat'
	import { profile } from '$lib/stores/profile'
	import { onDestroy, onMount } from 'svelte'
	import Button from '$lib/components/button.svelte'
	import { canConnectWallet } from '$lib/services'

	const chatId = $page.params.chatId
	$: chat = $chats.chats.get(chatId)
	let unsubscribe: undefined | (() => unknown)

	onMount(async () => {
		unsubscribe = adapter.subscribeToChat && (await adapter.subscribeToChat(chatId))
	})

	onDestroy(() => {
		unsubscribe && unsubscribe()
	})

	function sendMessage(text: string) {
		adapter.sendChatMessage(chatId, text)
	}
</script>

{#if $profile.signer === undefined}
	<Container>
		<InfoBox>
			<Button
				variant="primary"
				icon={Wallet}
				label="Connect wallet"
				on:click={adapter.signIn}
				disabled={!canConnectWallet()}
			/>
			<span class="connect-info">
				{#if canConnectWallet()}
					Please connect wallet to check the chat.
				{:else}
					Please install a web3 wallet to access the chat.
				{/if}
			</span>
		</InfoBox>
	</Container>
{:else if $chats.loading}	
	<Loading>
		<svelte:fragment slot="title">
			Loading chat
		</svelte:fragment>
	</Loading>
{:else if $chats.error}
	<Container>
		<InfoBox>
			<div>Something went wrong</div>
		</InfoBox>
	</Container>
{:else if chat === undefined}
	<div>There is no chat</div>
{:else}
	<ChatScreen
		{chat}
		{sendMessage}
		title={chat.closed ? 'Closed chat' : 'Active chat'}
		onBack={() => goto(ROUTES.CHATS)}
	/>
{/if}
