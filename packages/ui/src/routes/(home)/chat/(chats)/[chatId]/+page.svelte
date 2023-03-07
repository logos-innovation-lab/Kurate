<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	import ChatScreen from '$lib/components/chat-screen.svelte'

	import { ROUTES } from '$lib/routes'
	import { chats, type Chat } from '$lib/stores/chat'

	const chatId = $page.params.chatId as unknown as number
	let chat: Chat

	function sendMessage(text: string) {
		chats.update((state) => {
			const newState = { ...state }
			newState.chats[chatId].messages.push({
				timestamp: Date.now(),
				text,
				myMessage: true,
			})

			return newState
		})
	}

	$: chat = $chats.chats[chatId]
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
