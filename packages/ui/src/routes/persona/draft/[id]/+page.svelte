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
	import { clipAndResize } from '$lib/utils/image'

	const MAX_DIMENSIONS = {
		PICTURE: {
			width: 268,
			height: 268,
		},
		COVER: {
			width: 1024,
			height: 360,
		},
	}

	let persona = $personas.draft[Number($page.params.id)]
	let cover: FileList | undefined = undefined
	let picture: FileList | undefined = undefined

	let personaPicture: string | undefined = undefined
	let personaCover: string | undefined = undefined

	async function resizePersonaPicture(picture?: File) {
		try {
			personaPicture = picture
				? await clipAndResize(picture, MAX_DIMENSIONS.PICTURE.width, MAX_DIMENSIONS.PICTURE.height)
				: personaPicture ?? persona.picture
		} catch (error) {
			console.error(error)
		}
	}

	async function resizePersonaCover(cover?: File) {
		try {
			personaCover = cover
				? await clipAndResize(cover, MAX_DIMENSIONS.COVER.width, MAX_DIMENSIONS.COVER.height)
				: personaCover ?? persona.cover
		} catch (error) {
			console.error(error)
		}
	}

	$: resizePersonaPicture(picture && picture[0])
	$: resizePersonaCover(cover && cover[0])
</script>

{#if persona === undefined}
	<div>There is no persona with group ID {$page.params.id}</div>
{:else}
	<div class="wrapper">
		<div class="top">
			{#if personaCover}
				<div class="img">
					<img src={personaCover} alt="profile" />
				</div>
			{/if}
		</div>
		<div class="buttons">
			<Button icon={Undo} variant="primary" on:click={() => goto(ROUTES.HOME)} />
			<InputFile
				icon={personaCover ? Renew : Image}
				variant="primary"
				label={personaCover ? 'Change cover' : 'Add cover'}
				bind:files={cover}
			/>
		</div>
		<div class="avatar">
			{#if personaPicture}
				<div class="img">
					<img src={personaPicture} alt="profile" />
				</div>
				<div class="change">
					<InputFile icon={Renew} variant="primary" bind:files={picture} />
				</div>
			{:else}
				<div class="empty">
					<InputFile icon={Image} variant="primary" label="Add picture" bind:files={picture} />
				</div>
			{/if}
		</div>

		<div>{persona.name}</div>
		<div>{persona.pitch}</div>
		<div>{persona.description}</div>

		<Button variant="secondary" label="Edit text" icon={Edit} />
		<Button
			variant="primary"
			label="Save changes"
			icon={Checkmark}
			disabled={!personaCover || !personaPicture}
			on:click={() => {
				personas.updateDraft(Number($page.params.id), {
					...persona,
					picture: personaPicture,
					cover: personaCover,
				})
				goto(ROUTES.HOME)
			}}
		/>

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

		.img {
			position: absolute;
			width: inherit;
			height: inherit;
			display: flex;
			justify-content: center;
			align-items: center;

			.img {
				max-height: 360px;
				max-width: 100vw;
				object-fit: fit;
			}
		}
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

		.img {
			position: absolute;
			width: inherit;
			height: inherit;
			display: flex;
			justify-content: center;
			align-items: center;
			.img {
				max-width: 268px;
				max-height: 268px;
				object-fit: fit;
			}
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
