<script lang="ts">
	import { goto } from '$app/navigation'

	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import SortAscending from '$lib/components/icons/sort-ascending.svelte'
	import SortDescending from '$lib/components/icons/sort-descending.svelte'

	import Button from '$lib/components/button.svelte'
	import ChatComponent from '$lib/components/chat.svelte'
	import Dropdown from '$lib/components/dropdown.svelte'
	import Grid from '$lib/components/grid.svelte'
	import Search from '$lib/components/search.svelte'
	import SectionTitle from '$lib/components/section-title.svelte'

	import { chats as chatsStore, type Chat } from '$lib/stores/chat'
	import { profile } from '$lib/stores/profile'
	import { ROUTES } from '$lib/routes'
	import { formatDateAndTime } from '$lib/utils/format'

	let openChats: Chat[]
	let closedChats: Chat[] = $chatsStore.chats.filter((c) => c.blocked || c.closed)
	let sortAsc = true
	let filterQuery = ''

	$: openChats = $chatsStore.chats
		.filter((c) => !c.blocked && !c.closed)
		.filter(
			(chat) =>
				chat.persona.name.includes(filterQuery) ||
				chat.post.text.includes(filterQuery) ||
				chat.messages[chat.messages.length - 1].text.includes(filterQuery),
		)
</script>

{#if $profile.signer === undefined}
	<SectionTitle title="Please login" />
{:else if $chatsStore.loading === true}
	<SectionTitle title="Loading..." />
{:else}
	<SectionTitle title="Active chats">
		<svelte:fragment slot="buttons">
			<Dropdown
				icon={SettingsView}
				options={[
					{
						text: 'Sort by date of creation',
						action: () => console.log('Sort by date of creation'),
					},
					{
						text: 'Sort by recent activity',
						action: () => console.log('Sort by recent activity'),
					},
					{
						text: 'Sort by number of participants',
						action: () => console.log('Sort by number of participants'),
					},
					{
						text: 'Sort by number of posts',
						action: () => console.log('Sort by number of posts'),
					},
					{
						text: 'Sort by name (alphabetical)',
						action: () => console.log('Sort by name (alphabetical)'),
					},
				]}
			/>
			<Button
				icon={sortAsc ? SortAscending : SortDescending}
				on:click={() => (sortAsc = !sortAsc)}
			/>
		</svelte:fragment>
		<Search bind:filterQuery />
	</SectionTitle>
	<Grid>
		{#each openChats as chat, index}
			<ChatComponent
				chatPersonaPicture={chat.persona.picture}
				chatPersonaName={chat.persona.name}
				chatPostText={chat.post.text}
				chatMessage={chat.messages[chat.messages.length - 1].text}
				timeStamp={formatDateAndTime(chat.messages[chat.messages.length - 1].timestamp)}
				on:click={() => goto(ROUTES.CHAT(index))}
			/>
		{/each}
	</Grid>

	{#if closedChats.length > 0}
		<SectionTitle title="Closed chats" />
		<Grid>
			{#each closedChats as chat, index}
				<ChatComponent
					chatPersonaPicture={chat.persona.picture}
					chatPersonaName={chat.persona.name}
					chatPostText={chat.post.text}
					chatMessage={chat.messages[chat.messages.length - 1].text}
					timeStamp={formatDateAndTime(chat.messages[chat.messages.length - 1].timestamp)}
					on:click={() => goto(ROUTES.CHAT(index))}
				/>
			{/each}
		</Grid>
	{/if}
{/if}
