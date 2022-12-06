<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import UserAdmin from '$lib/components/icons/user-admin.svelte'
	import Input from '$lib/components/input.svelte'
	import InputFile from '$lib/components/input-file.svelte'
	import Image from '$lib/components/icons/image.svelte'
	import InputString from '$lib/components/input-string.svelte'
	import { profile } from '$lib/stores/profile'
	import { formatAddress } from '$lib/utils'
	import { goto } from '$app/navigation'

	const generateRandomHex = (size: number) =>
		`0x${[...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`

	let address = generateRandomHex(40)
	let name = ''
	let files: FileList | undefined = undefined
	let file: File | undefined = undefined
	let image: string | undefined
	let disabled = true

	$: file = files && files[0]
	$: image = file ? URL.createObjectURL(file) : undefined
	$: disabled = name === '' || image === undefined
</script>

<div class="header">
	<h1>Create identity</h1>
	<Button icon={Close} on:click={() => goto('/profile')} />
</div>
<div class="content">
	<Input title="Public address">
		<div>{formatAddress(address, 8)}</div>
	</Input>

	<Input title="Name">
		<InputString bind:value={name} placeholder="Enter identity name…" />
	</Input>

	<Input title="Profile picture">
		<div class="profile">
			{#if image !== undefined}
				<img src={image} alt={file?.name} />
			{/if}
			<InputFile bind:files label="Add image..." icon={Image} variant="secondary" />
		</div>
		{#if file !== undefined}
			<span>{file.name}</span>
		{/if}
	</Input>

	<div class="action">
		<Button
			icon={UserAdmin}
			variant="primary"
			{disabled}
			label="Confirm and create"
			on:click={() => {
				const user = { address, name, avatar: image }
				$profile.profiles = [...$profile.profiles, user]
				goto('/profile')
			}}
		/>
	</div>
</div>

<style lang="scss">
	.header {
		left: 0;
		right: 0;
		top: 0;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.content {
		display: flex;
		flex-direction: column;
	}
	.action {
		border-top: 1px solid var(--color-light-grey-background);
		padding: var(--spacing-24);
		display: flex;
		justify-content: center;
	}
	.profile {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		img {
			width: 200px;
			height: 200px;
			object-fit: contain;
		}
	}
</style>
