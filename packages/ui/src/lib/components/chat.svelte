<script lang="ts">
	import Card from '$lib/components/grid-card.svelte'

	export let chatPersonaPicture: string | undefined
	export let chatPersonaName: string | undefined
	export let chatPostText: string | undefined
	export let chatMessage: string | undefined
	export let timeStamp: string | undefined
</script>

<Card on:click>
	<div class="picture"><img src={chatPersonaPicture} alt={chatPersonaName} /></div>
	<div class="details">
		<div class="post-text">{chatPostText}</div>
		<div class="chat-message">{chatMessage}</div>
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
