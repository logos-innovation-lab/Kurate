<script lang="ts">
	import { goto } from '$app/navigation'

	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'

	import Button from '$lib/components/button.svelte'
	import ChatComponent from '$lib/components/chat.svelte'
	import Dropdown from '$lib/components/dropdown.svelte'
	import DropdownItem from '$lib/components/dropdown-item.svelte'
	import Grid from '$lib/components/grid.svelte'
	import Search from '$lib/components/search.svelte'
	import SectionTitle from '$lib/components/section-title.svelte'

	import { chats as chatsStore, type Chat } from '$lib/stores/chat'
	import { profile } from '$lib/stores/profile'
	import { ROUTES } from '$lib/routes'
	import { formatDateAndTime } from '$lib/utils/format'

	interface ChatListItem {
		chat: Chat
		id: number
	}

	let openChats: ChatListItem[]
	let closedChats: ChatListItem[] = $chatsStore.chats
		.map((chat, id) => ({ chat, id }))
		.filter(({ chat }) => chat.blocked || chat.closed)
	let sortAsc = true
	let sortBy: 'date' | 'activity' | 'alphabetical' = 'date'
	let filterQuery = ''

	$: openChats = $chatsStore.chats
		.map((chat, id) => ({ chat, id }))
		.filter(
			({ chat }) =>
				!chat.blocked &&
				!chat.closed &&
				(chat.persona.name.includes(filterQuery) ||
					chat.post.text.includes(filterQuery) ||
					chat.messages[chat.messages.length - 1].text.includes(filterQuery)),
		)
</script>

{#if $profile.signer === undefined}
	<SectionTitle title="Please login" />
{:else if $chatsStore.loading === true}
	<SectionTitle title="Loading..." />
{:else}
	<SectionTitle title="Active chats">
		<svelte:fragment slot="buttons">
			<Dropdown icon={SettingsView}>
				<DropdownItem active={sortBy === 'date'} on:click={() => (sortBy = 'date')}>
					Sort by date of creation
				</DropdownItem>
				<DropdownItem active={sortBy === 'activity'} on:click={() => (sortBy = 'activity')}>
					Sort by recent activity
				</DropdownItem>
				<DropdownItem active={sortBy === 'alphabetical'} on:click={() => (sortBy = 'alphabetical')}>
					Sort by name (alphabetical)
				</DropdownItem>
			</Dropdown>
			<Button
				icon={sortAsc ? SortAscending : SortDescending}
				on:click={() => (sortAsc = !sortAsc)}
			/>
		</svelte:fragment>
		<Search bind:filterQuery />
	</SectionTitle>
	<Grid>
		{#each openChats as { chat, id }}
			<ChatComponent
				chatPersonaPicture={chat.persona.picture}
				chatPersonaName={chat.persona.name}
				chatPostText={chat.post.text}
				chatMessage={chat.messages[chat.messages.length - 1].text}
				timeStamp={formatDateAndTime(chat.messages[chat.messages.length - 1].timestamp)}
				on:click={() => goto(ROUTES.CHAT(id))}
			/>
		{/each}
	</Grid>

	{#if closedChats.length > 0}
		<SectionTitle title="Closed chats" />
		<Grid>
			{#each closedChats as { chat, id }}
				<ChatComponent
					chatPersonaPicture={chat.persona.picture}
					chatPersonaName={chat.persona.name}
					chatPostText={chat.post.text}
					chatMessage={chat.messages[chat.messages.length - 1].text}
					timeStamp={formatDateAndTime(chat.messages[chat.messages.length - 1].timestamp)}
					on:click={() => goto(ROUTES.CHAT(id))}
				/>
			{/each}
		</Grid>
	{/if}
{/if}
