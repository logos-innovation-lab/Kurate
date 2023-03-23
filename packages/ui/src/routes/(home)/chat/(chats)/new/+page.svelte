<script lang="ts">
	import { goto } from '$app/navigation'

	import ChatScreen from '$lib/components/chat-screen.svelte'

	import { chats } from '$lib/stores/chat'
	import { ROUTES } from '$lib/routes'
	import adapters from '$lib/adapters'

	const draftChat = $chats.draft

	async function sendMessage(text: string) {
		if (!draftChat) return
		draftChat.messages = [{ timestamp: Date.now(), text, myMessage: true }]
		const length = await adapters.startChat(draftChat)
		goto(ROUTES.CHAT(length - 1))
	}
</script>

{#if draftChat === undefined}
	<div>There is no chat</div>
{:else}
	<ChatScreen chat={draftChat} {sendMessage} title="New chat" onBack={() => history.back()} />
{/if}

<style lang="scss">
</style>
