<script lang="ts">
	import ViewOff from '$lib/components/icons/view-off.svelte'
	import View from '$lib/components/icons/view.svelte'
	import SendAltFilled from '$lib/components/icons/send-alt-filled.svelte'
	import Info from '$lib/components/icons/information.svelte'
	import Menu from '$lib/components/icons/overflow-menu-vertical.svelte'

	import Button from '$lib/components/button.svelte'
	import Header from '$lib/components/header.svelte'
	import Post from '$lib/components/post.svelte'
	import Textarea from '$lib/components/textarea.svelte'
	import InfoBox from '$lib/components/info-box.svelte'
	import Persona from '$lib/components/persona.svelte'
	import Divider from '$lib/components/divider.svelte'
	import Dropdown from '$lib/components/dropdown.svelte'
	import Spacer from '$lib/components/spacer.svelte'
	import DropdownItem from '$lib/components/dropdown-item.svelte'
	import SingleColumn from '$lib/components/single-column.svelte'
	import LearnMore from './learn-more.svelte'

	import type { Chat, DraftChat } from '$lib/stores/chat'
	import { formatDateAndTime } from '$lib/utils/format'
	import { createAvatar } from '@dicebear/core'
	import { botttsNeutral } from '@dicebear/collection'
	import { profile } from '$lib/stores/profile'
	import { onDestroy, onMount } from 'svelte'

	export let chat: Chat | DraftChat
	export let sendMessage: (text: string) => unknown
	export let onBack: (() => unknown) | undefined = undefined
	export let title: string

	let showPost = false
	let messageText = ''
	let sending = false
	let scrollElement: HTMLElement
	let scrolled = false
	const observer = new IntersectionObserver(([ob]) => (scrolled = !ob.isIntersecting))

	const toggleShowPost = () => (showPost = !showPost)
	const onSendMessage = async () => {
		if (messageText === '' || sending) return
		const sc = scrolled
		sending = true
		await sendMessage(messageText)
		sending = false
		messageText = ''
		if (!sc && scrollElement) setTimeout(() => scrollElement.scrollIntoView(), 100)
	}

	let avatar = createAvatar(botttsNeutral, {
		size: 94, // This is 47pt at 2x resolution
		seed: (chat as Chat).chatId,
	}).toDataUriSync()

	$: if (scrollElement) observer.observe(scrollElement)

	// This scrolls on new message from me
	$: if (!scrolled && scrollElement) scrollElement.scrollIntoView()

	// This scrolls on new message from counter party
	let len = chat.messages.length
	$: if (len < chat.messages.length && !scrolled) {
		setTimeout(() => scrollElement.scrollIntoView(), 50)
		len = chat.messages.length
	}

	onDestroy(() => observer.unobserve(scrollElement))
	onMount(() => setTimeout(() => scrollElement.scrollIntoView(), 50))
</script>

<div class="root">
	<Header {title} {onBack}>
		<!-- TODO: add actions to dropdown buttons -->
		<Dropdown>
			<Button slot="button" icon={Menu} />

			{#if chat.closed === true}
				<DropdownItem onClick={() => console.log('re-open')}>Re-open chat</DropdownItem>
				<DropdownItem onClick={() => console.log('delete for me')}>Delete for me</DropdownItem>
				<DropdownItem onClick={() => console.log('delete & block')} danger>
					Delete & block sender...
				</DropdownItem>
			{:else}
				<DropdownItem onClick={() => console.log('close')}>Close chat</DropdownItem>
				<DropdownItem onClick={() => console.log('delete & block')} danger>
					Delete & block sender...
				</DropdownItem>
			{/if}
		</Dropdown>
	</Header>
	<div class="original-post">
		{#if showPost}
			<SingleColumn>
				<div class="original-header">
					<h3>Original post</h3>
					<Button icon={ViewOff} on:click={toggleShowPost} />
				</div>
			</SingleColumn>
			<Post class="detail" post={chat.post} noHover />
			<Persona
				noHover
				noBorder
				name={chat.persona.name}
				pitch={chat.persona.pitch}
				postsCount={chat.persona.postsCount}
				picture={chat.persona.picture}
				participantsCount={chat.persona.participantsCount}
				minReputation={chat.persona.minReputation}
			/>
		{:else}
			<div class="btn">
				<Button icon={View} label="View original post" on:click={toggleShowPost} />
			</div>
		{/if}
	</div>

	<!-- Extra content -->
	<div class="messages">
		{#if chat.messages.length > 0}
			<Divider />
			<SingleColumn>
				<slot />

				<div class="messages-inner">
					<!-- Chat bubbles -->
					{#each chat.messages as message}
						{@const myMessage = message.address === $profile.address}
						{@const systemMessage = message.address === 'system'}
						<div
							class={`message ${myMessage ? '' : 'their-message'} ${systemMessage ? 'system' : ''}`}
						>
							<div class="message-content">
								{#if !myMessage}
									<img src={avatar} class="avatar" alt="Avatar" />
								{/if}
								<div class="message-text">{message.text}</div>
							</div>
							<div class="timestamp">
								{formatDateAndTime(message.timestamp)}
								{#if systemMessage}
									<br />
									This is an automated message
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</SingleColumn>
		{:else}
			<Divider />
			<SingleColumn>
				<Spacer />
				<InfoBox>
					<div class="icon">
						<Info size={32} />
					</div>
					<p class="h2">Start a new chat</p>
					<p>This will send an anonymous and private message to the writer of this post.</p>
					<LearnMore href="https://kurate-faq.vercel.app/chat/what-is-chat" />
				</InfoBox>
			</SingleColumn>
		{/if}
		{#if chat.closed === true}
			<Divider />
			<SingleColumn>
				<Spacer />
				<InfoBox>
					<div class="icon">
						<Info size={32} />
					</div>
					<h3>This chat is closed.</h3>
					<p>You can use the menu in the top-right corner to re-open it.</p>
					<LearnMore href="https://kurate-faq.vercel.app/chat/close-and-reopen-chat" />
				</InfoBox>
			</SingleColumn>
		{/if}
		<div bind:this={scrollElement} />
	</div>

	<!-- Chat input -->
	{#if chat.closed !== true}
		<div class="chat-input-wrapper">
			<Divider />
			<SingleColumn>
				<div class="chat-input">
					<div class="textarea">
						<Textarea
							placeholder="Say something"
							on:keypress={(e) => {
								if (e.key === 'Enter') {
									onSendMessage()
									e.preventDefault()
								}
							}}
							bind:value={messageText}
						/>
					</div>
					<div class="chat-buttons">
						<Button
							icon={SendAltFilled}
							variant="primary"
							on:click={onSendMessage}
							disabled={messageText === '' || sending}
						/>
					</div>
				</div>
			</SingleColumn>
		</div>
	{/if}
</div>

<style lang="scss">
	.avatar {
		width: var(--spacing-48);
		height: var(--spacing-48);
	}

	.original-post {
		@media (min-width: 688px) {
			padding-bottom: var(--spacing-24);
		}
		.original-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.btn {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.messages {
		margin-bottom: 96px;

		.messages-inner {
			padding-top: var(--spacing-48);
		}

		.message {
			display: flex;
			gap: var(--spacing-6);
			flex-direction: column;
			align-items: flex-end;
			margin-bottom: var(--spacing-24);

			.message-content {
				display: flex;
				flex-direction: row;
				gap: var(--spacing-6);
				align-items: flex-end;
			}

			.message-text {
				border: 1px solid var(--grey-200);
				padding: var(--spacing-12);
				border-radius: var(--spacing-24);
				border-bottom-right-radius: 0;
				display: inline-block;
				font-family: var(--font-serif);
				font-size: var(--font-size-lg);
			}

			.timestamp {
				font-size: var(--font-size-sm);
			}

			&.their-message {
				align-items: flex-start;

				.message-text {
					border-bottom-left-radius: 0;
					border-bottom-right-radius: var(--spacing-24);
					background-color: var(--grey-200);
				}
			}

			&.system {
				text-align: right;
				margin-bottom: var(--spacing-48);
				> div:first-child {
					color: var(--grey-300);
				}
			}
		}
	}

	.chat-input-wrapper {
		position: fixed;
		inset: auto 0 0 0;
		background-color: var(--color-body-bg);
		transition: background-color 0.2s;

		&:focus-within {
			background-color: var(--grey-150);
			transition: background-color 0.2s;
		}

		.chat-input {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: var(--spacing-12);
			padding-block: var(--spacing-12);

			.textarea {
				flex-basis: 100%;
			}
			.chat-buttons {
				display: flex;
				justify-content: flex-end;
				gap: var(--spacing-12);
				flex-grow: 0;
			}
		}
	}
</style>
