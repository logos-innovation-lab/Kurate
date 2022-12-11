<script lang="ts">
	import { goto } from '$app/navigation'
	import Avatar from '$lib/components/avatar.svelte'
	import Button from '$lib/components/button.svelte'
	import Collaborate from '$lib/components/icons/collaborate.svelte'
	import Logout from '$lib/components/icons/logout.svelte'
	import Image from '$lib/components/icons/image.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'
	import InputFile from '$lib/components/input-file.svelte'
	import InputString from '$lib/components/input-string.svelte'
	import Input from '$lib/components/input.svelte'
	import { ROUTES } from '$lib/routes'
	import { profile } from '$lib/stores/profile'
	import Renew from '$lib/components/icons/renew.svelte'

	let files: FileList | undefined = undefined
	let file: File | undefined = undefined

	$: file = files && files[0]
	$: if ($profile.active && file) $profile.active.avatar = URL.createObjectURL(file)
</script>

<div class="header">
	<div>
		<Button icon={Undo} on:click={() => history.back()} />
		<h1>Account</h1>
	</div>
	<Button
		variant="primary"
		icon={Logout}
		label="Logout"
		on:click={() => ($profile.key = undefined)}
		disabled={!$profile.key}
	/>
</div>
<div class="content">
	{#if $profile.key?.publicKey === undefined}
		<Button
			variant="primary"
			icon={Wallet}
			label="Connect wallet to post"
			on:click={() => ($profile.key = { publicKey: '0x90b1c0A1EeF1fe519AeE75D2Ee04855219923f26' })}
		/>
		<span>Connect a wallet to access or create your account.</span>
	{:else}
		<span>Wallet & Identity</span>
		<Input title="Connected wallet">
			<span>{$profile.key.publicKey}</span>
		</Input>
		{#if $profile.active === undefined}
			<Button
				variant="primary"
				icon={Collaborate}
				label="Select identity"
				on:click={() => goto(ROUTES.IDENTITY)}
			/>
			<span>Select an identity to use with your account.</span>
		{:else}
			<div>
				<span>Selected identity</span>
				<Avatar src={$profile.active.avatar} />
				<span>{$profile.active.name}</span>
				<span>{$profile.active.address}</span>
				<Button icon={Collaborate} on:click={() => goto(ROUTES.IDENTITY)} />
			</div>

			<Input title="Name">
				<InputString bind:value={$profile.active.name} placeholder="Enter identity name…" />
			</Input>

			<Input title="Profile picture">
				<div class="profile">
					{#if $profile.active.avatar !== undefined}
						<img src={$profile.active.avatar} alt={file?.name} />
						<InputFile bind:files label="Change" icon={Renew} variant="secondary" />
					{:else}
						<InputFile bind:files label="Add image..." icon={Image} variant="secondary" />
					{/if}
				</div>
			</Input>
		{/if}
	{/if}
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
		align-items: center;
	}
</style>
