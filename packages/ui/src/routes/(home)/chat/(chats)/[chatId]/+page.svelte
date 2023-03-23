<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	import adapter from '$lib/adapters'

	import ChatScreen from '$lib/components/chat-screen.svelte'

	import { ROUTES } from '$lib/routes'
	import { chats, type Chat } from '$lib/stores/chat'
	import { onDestroy, onMount } from 'svelte'

	const chatId = $page.params.chatId as unknown as number
	let chat: Chat
	let unsubscribe: () => void

	onMount(() => {
		unsubscribe = adapter.subscribeToChat(chatId)
	})

	onDestroy(() => {
		unsubscribe && unsubscribe()
	})

	function sendMessage(text: string) {
		adapter.sendChatMessage(chatId, text)
	}

	$: chat = $chats.chats[chatId]
</script>

{#if chat === undefined}
	<div>There is no chat</div>
{:else}
	<ChatScreen
		{chat}
		{sendMessage}
		title={chat.closed ? 'Closed chat' : chat.blocked ? 'Blocked chat' : 'Active chat'}
		onBack={() => goto(ROUTES.CHATS)}
	/>
{/if}

<style lang="scss">
</style>
