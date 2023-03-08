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
	import LearnMore from './learn-more.svelte'

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
			<div class={`${message.myMessage ? 'my-message' : ''} ${message.system ? 'system' : ''}`}>
				<div>{message.text}</div>
				<div>{formatDateAndTime(message.timestamp)}</div>
				{#if message.system}
					<div>This is an automated message</div>
				{/if}
			</div>
		{/each}
		{#if chat.blocked === true}
			<h3>Your interlocutor has deleted this chat and blocked you.</h3>
			<p>You can’t re-open this chat or contact that person.</p>
			<LearnMore />
		{:else if chat.closed === true}
			<h3>This chat is closed.</h3>
			<p>You can use the menu in the top-right corner to re-open it.</p>
			<LearnMore />
		{/if}
	</div>

	<!-- Chat input -->
	{#if chat.blocked !== true && chat.closed !== true}
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
	{/if}
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
	.system {
		color: grey;
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
