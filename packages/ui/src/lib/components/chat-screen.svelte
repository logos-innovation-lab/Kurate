<script lang="ts">
	import ViewOff from '$lib/components/icons/view-off.svelte'
	import View from '$lib/components/icons/view.svelte'
	import Image from '$lib/components/icons/image.svelte'
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

	import type { Chat } from '$lib/stores/chat'
	import { formatDateAndTime } from '$lib/utils/format'
	import { createAvatar } from '@dicebear/core'
	import { botttsNeutral } from '@dicebear/collection'

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

	let avatar = createAvatar(botttsNeutral, {
		size: 94, // This is 47pt at 2x resolution
		seed: chat.seed,
	}).toDataUriSync()
</script>

<div class="root">
	<Header {title} {onBack}>
		<!-- TODO: add actions to dropdown buttons -->
		<Dropdown>
			<Button slot="button" icon={Menu} />

			{#if chat.blocked === true}
				<DropdownItem onClick={() => console.log('delete for me')}>Delete for me</DropdownItem>
				<DropdownItem onClick={() => console.log('delete & block')} danger>
					Delete & block sender...
				</DropdownItem>
			{:else if chat.closed === true}
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
						<div
							class={`message ${message.myMessage ? 'my-message' : ''} ${
								message.system ? 'system' : ''
							}`}
						>
							<div class="message-content">
								{#if message.myMessage}
									<img src={avatar} class="avatar" alt="Avatar" />
								{/if}
								<div class="message-text">{message.text}</div>
							</div>
							<div class="timestamp">
								{formatDateAndTime(message.timestamp)}
								{#if message.system}
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
					<LearnMore href="/" />
				</InfoBox>
			</SingleColumn>
		{/if}
		{#if chat.blocked === true}
			<Divider />
			<SingleColumn>
				<Spacer />
				<InfoBox>
					<div class="icon">
						<Info size={32} />
					</div>
					<h3>Your interlocutor has deleted this chat and blocked you.</h3>
					<p>You can't re-open this chat or contact that person.</p>
					<LearnMore />
				</InfoBox>
			</SingleColumn>
		{:else if chat.closed === true}
			<Divider />
			<SingleColumn>
				<Spacer />
				<InfoBox>
					<div class="icon">
						<Info size={32} />
					</div>
					<h3>This chat is closed.</h3>
					<p>You can use the menu in the top-right corner to re-open it.</p>
					<LearnMore />
				</InfoBox>
			</SingleColumn>
		{/if}
	</div>

	<!-- Chat input -->
	{#if chat.blocked !== true && chat.closed !== true}
		<div class="chat-input-wrapper">
			<Divider />
			<SingleColumn>
				<div class="chat-input">
					<div class="textarea">
						<Textarea placeholder="Say something" bind:value={messageText} />
					</div>
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
			</SingleColumn>
		</div>
	{/if}
</div>

<style lang="scss">
	// FIXME: style this properly please
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

			&.my-message {
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

		.chat-input {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: var(--spacing-12);

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
