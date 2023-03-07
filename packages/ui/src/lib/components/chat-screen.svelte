<script lang="ts">
	import ViewOff from '$lib/components/icons/view-off.svelte'
	import View from '$lib/components/icons/view.svelte'
	import Image from '$lib/components/icons/image.svelte'
	import SendAltFilled from '$lib/components/icons/send-alt-filled.svelte'

	import Button from '$lib/components/button.svelte'
	import Header from '$lib/components/header.svelte'
	import Post from '$lib/components/post.svelte'
	import Textarea from '$lib/components/textarea.svelte'

	import type { Chat } from '$lib/stores/chat'
	import { formatDateAndTime } from '$lib/utils/format'

	export let chat: Chat
	export let sendMessage: (text: string) => unknown
	export let onBack: (() => unknown) | undefined = undefined
	export let title: string

	let showPost = true
	let messageText = ''
	let sending = false

	const toggleShowPost = () => (showPost = !showPost)
	const onSendMessage = async () => {
		sending = true
		await sendMessage(messageText)
		sending = false
		messageText = ''
	}
</script>

<div class="root">
	<Header {title} {onBack} />
	{#if showPost}
		<h3>Original post</h3>
		<Button icon={ViewOff} on:click={toggleShowPost} />
		<Post post={chat.post} />
	{:else}
		<Button icon={View} label="View original post" on:click={toggleShowPost} />
	{/if}

	<!-- Extra content -->
	<div class="center">
		<slot />

		<!-- Chat bubbles -->
		{#each chat.messages as message}
			<div class={message.myMessage ? 'my-message' : ''}>
				<div>{message.text}</div>
				<div>{formatDateAndTime(message.timestamp)}</div>
			</div>
		{/each}
	</div>

	<!-- Chat input -->
	<div class="chat-input">
		<Textarea placeholder="Say something" bind:value={messageText} />
		<div class="chat-buttons">
			<Button icon={Image} />
			<Button
				icon={SendAltFilled}
				variant="primary"
				on:click={onSendMessage}
				disabled={messageText === '' || sending}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	.root {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		height: 100vh;
	}

	.center {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-grow: 1;
	}
	.my-message {
		background-color: lightgrey;
	}

	.chat-input {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		flex-grow: 0;
	}
	.chat-buttons {
		flex-direction: row;
	}
</style>
