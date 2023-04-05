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

	let openChats: Chat[]
	let closedChats: Chat[]
	let allChats: Chat[] = Array.from($chatsStore.chats.entries()).map(([chatId, chat]) => ({
		...chat,
		chatId,
	}))
	$: if ($profile.signer)
		allChats = Array.from($chatsStore.chats.entries()).map(([chatId, chat]) => ({
			...chat,
			chatId,
		}))

	type SortBy = 'activity' | 'alphabetical'
	interface SortByOption {
		sortBy: SortBy
		label: string
	}
	let sortAsc = false
	let sortBy: SortBy = 'activity'
	let filterQuery = ''

	const sortByOptions: SortByOption[] = [
		{ sortBy: 'activity', label: 'Sort by recent activity' },
		{ sortBy: 'alphabetical', label: 'Sort by name (alphabetical)' },
	]

	$: openChats = allChats
		.filter(
			({ closed, persona, post }) =>
				(!closed && persona.name.includes(filterQuery)) || post.text.includes(filterQuery),
		)
		.sort((a, b) => {
			if (sortBy === 'activity') {
				const lastMessageA = a.messages[a.messages.length - 1]
				const lastMessageB = b.messages[b.messages.length - 1]
				return sortAsc
					? lastMessageA.timestamp - lastMessageB.timestamp
					: lastMessageB.timestamp - lastMessageA.timestamp
			}
			return sortAsc
				? a.post.text.localeCompare(b.post.text)
				: b.post.text.localeCompare(a.post.text)
		})
	$: closedChats = allChats.filter(({ closed }) => closed)
</script>

{#if $profile.signer === undefined}
	<SectionTitle title="Please login" />
{:else if $chatsStore.loading === true}
	<SectionTitle title="Loading..." />
{:else}
	<SectionTitle title="Active chats">
		<svelte:fragment slot="buttons">
			<Dropdown>
				<Button slot="button" icon={SettingsView} />

				{#each sortByOptions as option}
					<DropdownItem active={sortBy === option.sortBy} onClick={() => (sortBy = option.sortBy)}>
						{option.label}
					</DropdownItem>
				{/each}
			</Dropdown>
			<Button
				icon={sortAsc ? SortAscending : SortDescending}
				on:click={() => (sortAsc = !sortAsc)}
			/>
		</svelte:fragment>
		<Search bind:filterQuery />
	</SectionTitle>
	<Grid>
		{#each openChats as chat}
			{@const lastMessage = chat.messages[chat.messages.length - 1]}
			<ChatComponent
				seed={chat.chatId}
				name={chat.persona?.name}
				postText={chat.post?.text}
				lastMessage={lastMessage?.text}
				timeStamp={formatDateAndTime(lastMessage?.timestamp || 0)}
				on:click={() => goto(ROUTES.CHAT(chat.chatId))}
			/>
		{/each}
	</Grid>

	{#if closedChats.length > 0}
		<SectionTitle title="Closed chats" />
		<Grid>
			{#each closedChats as chat}
				{@const lastMessage = chat.messages[chat.messages.length - 1]}
				<ChatComponent
					seed={chat.chatId}
					name={chat.persona?.name}
					postText={chat.post?.text}
					lastMessage={lastMessage?.text}
					timeStamp={formatDateAndTime(lastMessage?.timestamp || 0)}
					on:click={() => goto(ROUTES.CHAT(chat.chatId))}
				/>
			{/each}
		</Grid>
	{/if}
{/if}
