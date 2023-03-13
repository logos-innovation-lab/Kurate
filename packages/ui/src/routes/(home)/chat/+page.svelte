<script lang="ts">
	import { goto } from '$app/navigation'
	import Button from '$lib/components/button.svelte'

	import Card from '$lib/components/grid-card.svelte'
	import Grid from '$lib/components/grid.svelte'
	import Search from '$lib/components/icons/search.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'

	import { ROUTES } from '$lib/routes'
	import { chats as chatsStore } from '$lib/stores/chat'
	import { profile } from '$lib/stores/profile'
	import { formatDateAndTime } from '$lib/utils/format'

	let chats = $chatsStore.chats
	let filterText = ''

	$: chats = $chatsStore.chats.filter(
		(chat) =>
			chat.persona.name.includes(filterText) ||
			chat.post.text.includes(filterText) ||
			chat.messages[chat.messages.length - 1].text.includes(filterText),
	)
</script>

{#if $profile.signer === undefined}
	<div>Please login</div>
{:else if $chatsStore.loading === true}
	<div>Loading...</div>
{:else}
	<div class="personas-wrap">
		<div>
			<div class="personas-filter">
				<div class="personas-title">All personas</div>
				<div class="btns">
					<Button icon={SettingsView} />
				</div>
			</div>
			<div class="search-field">
				<Search />
				<input bind:value={filterText} placeholder="Search..." />
			</div>
		</div>
	</div>

	<div>
		{#each chats as chat, index}
			<Grid>
				<Card on:click={() => goto(ROUTES.CHAT(index))}>
					<img src={chat.persona.picture} alt={chat.persona.name} />
					<div>
						<div>{chat.post.text}</div>
						<div>{chat.messages[chat.messages.length - 1].text}</div>
						<div>{formatDateAndTime(chat.messages[chat.messages.length - 1].timestamp)}</div>
					</div>
				</Card>
			</Grid>
		{/each}
	</div>
{/if}

<style lang="scss">
	.personas-wrap {
		border-bottom: 1px solid var(--grey-200);
		padding: var(--spacing-24);
		transition: padding 0.2s;

		> div {
			max-width: 450px;
			margin-inline: auto;

			@media (min-width: 688px) {
				max-width: 900px;
				transition: padding 0.2s;
			}

			@media (min-width: 1242px) {
				max-width: 1398px;
			}

			@media (min-width: 1640px) {
				max-width: 1896px;
			}

			@media (min-width: 2038px) {
				max-width: 2394px;
			}
		}

		@media (min-width: 688px) {
			padding: var(--spacing-48) var(--spacing-48) var(--spacing-24);
			border-bottom: none;
		}

		// @media (prefers-color-scheme: dark) {
		// 	&.border-top {
		// 		border-top-color: var(--grey-500);
		// 	}
		// 	border-bottom-color: var(--grey-500);
		// }

		.personas-filter {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;
			margin-bottom: var(--spacing-12);

			.personas-title {
				border-bottom: none;
			}

			@media (min-width: 688px) {
				margin-bottom: var(--spacing-24);
			}

			.btns {
				display: flex;
				justify-content: space-between;
				align-items: center;
				flex-direction: row;
				flex-wrap: nowrap;
				gap: var(--spacing-12);
			}
		}

		.search-field {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			flex-wrap: nowrap;
			flex-direction: row;
			gap: var(--spacing-12);

			@media (min-width: 688px) {
			}

			input {
				border: none;
				background-color: transparent;
				font-size: var(--font-size-lg);
			}
		}
	}
</style>
