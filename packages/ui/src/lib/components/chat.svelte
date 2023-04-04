<script lang="ts">
	import Card from '$lib/components/grid-card.svelte'
	import { botttsNeutral } from '@dicebear/collection'
	import { createAvatar } from '@dicebear/core'

	export let seed: string | undefined = undefined
	export let name: string | undefined = undefined
	export let postText: string | undefined = undefined
	export let lastMessage: string
	export let timeStamp: string

	let avatar = createAvatar(botttsNeutral, {
		size: 94,
		seed,
	}).toDataUriSync()

	function cropText(text: string, length: number) {
		if (text?.length < length) return text
		return `${text?.substring(0, length)}...`
	}
</script>

<Card on:click>
	<div class="picture"><img src={avatar} alt={name} /></div>
	<div class="details">
		<div class="post-text">{postText ? cropText(postText, 30) : ''}</div>
		<div class="chat-message">{cropText(lastMessage, 60)}</div>
		<div class="timestamp">
			{timeStamp}
		</div>
	</div>
</Card>

<style lang="scss">
	.picture {
		flex: 0 0 65px;
		aspect-ratio: 1;

		@media (min-width: 498px) {
			flex-basis: 73px;
		}

		@media (min-width: 688px) {
			flex-basis: 65px;
		}

		@media (min-width: 1542px) {
			flex-basis: 73px;
		}

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);

		.post-text {
			font-family: var(--font-serif);
			font-size: var(--font-size-normal);
			font-weight: var(--font-weight-sb);
			color: var(--grey-300);
			font-style: italic;
		}

		.chat-message {
			font-family: var(--font-serif);
			font-size: var(--font-size-lg);
		}

		.timestamp {
			font-size: var(--font-size-sm);
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
			flex-wrap: nowrap;
			gap: var(--spacing-12);
		}
	}
</style>
