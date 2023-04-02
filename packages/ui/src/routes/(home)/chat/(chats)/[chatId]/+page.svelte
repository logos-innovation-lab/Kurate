<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	import adapter from '$lib/adapters'

	import ChatScreen from '$lib/components/chat-screen.svelte'

	import { ROUTES } from '$lib/routes'
	import { chats, type Chat } from '$lib/stores/chat'
	import { onDestroy, onMount } from 'svelte'

	const chatId = $page.params.chatId
	let chat: Chat | undefined
	let unsubscribe: undefined | (() => unknown)

	onMount(() => {
		unsubscribe = adapter.subscribeToChat && adapter.subscribeToChat(chatId)
	})

	onDestroy(() => {
		unsubscribe && unsubscribe()
	})

	function sendMessage(text: string) {
		adapter.sendChatMessage(chatId, text)
	}

	$: chat = $chats.chats.get(chatId)
</script>

{#if chat === undefined}
	<div>There is no chat</div>
{:else}
	<ChatScreen
		{chat}
		{sendMessage}
		title={chat.closed ? 'Closed chat' : 'Active chat'}
		onBack={() => goto(ROUTES.CHATS)}
	/>
{/if}

<style lang="scss">
</style>
