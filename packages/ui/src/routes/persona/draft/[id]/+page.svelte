<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Image from '$lib/components/icons/image.svelte'
	import Renew from '$lib/components/icons/renew.svelte'

	import { personas } from '$lib/stores/persona'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'
	import InputFile from '$lib/components/input-file.svelte'

	let persona = $personas.draft[Number($page.params.id)]
	let cover = ''
	let picture = ''

	$: console.log({ cover, picture })
</script>

{#if persona === undefined}
	<div>There is no persona with group ID {$page.params.id}</div>
{:else}
	<div class="wrapper">
		<div class="top" />
		<div class="buttons">
			<Button icon={Undo} variant="primary" on:click={() => goto(ROUTES.HOME)} />
			<InputFile icon={Image} variant="primary" label="Add cover" bind:value={cover} />
		</div>
		<div class="avatar">
			{#if persona.picture}
				<img src={persona.picture} alt="profile" />
				<div class="change">
					<InputFile icon={Renew} variant="primary" bind:value={picture} />
				</div>
			{:else}
				<div class="empty">
					<InputFile icon={Image} variant="primary" label="Add picture" bind:value={picture} />
				</div>
			{/if}
		</div>

		<div>{persona.name}</div>
		<div>{persona.pitch}</div>
		<div>{persona.description}</div>

		<Button variant="secondary" label="Edit text" icon={Edit} />
		<Button variant="primary" label="Save changes" icon={Checkmark} />

		<p>Please provide at least a cover image.</p>
		<a href="/" target="_blank">Learn more →</a>
	</div>
{/if}

<style lang="scss">
	.top {
		height: 360px;
		width: 100vw;
		background-color: #666666;
		position: absolute;
		z-index: -1;
	}

	.buttons {
		padding: 48px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.avatar {
		width: 268px;
		height: 268px;
		background-color: #c9c9c9;
		margin: auto;

		img {
			position: absolute;
			width: inherit;
			height: inherit;
			object-fit: contain;
		}
		.empty {
			width: inherit;
			height: inherit;
			position: absolute;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.change {
			width: inherit;
			height: inherit;
			position: absolute;
			display: flex;
			justify-content: flex-end;
			align-items: flex-end;
			padding: 12px;
		}
	}
</style>
