<script lang="ts">
	import Image from '$lib/components/icons/image.svelte'
	import Renew from '$lib/components/icons/renew.svelte'
	import Undo from '$lib/components/icons/undo.svelte'

	import Button from '$lib/components/button.svelte'
	import InputFile from '$lib/components/input-file.svelte'

	import { clipAndResize } from '$lib/utils/image'

	import { MAX_DIMENSIONS } from '$lib/constants'

	export let name: string
	export let pitch: string
	export let description: string
	export let onBack: () => unknown = () => history.back()
	export let picture: string | undefined
	export let cover: string | undefined
	export let canEditPictures = false

	let coverFiles: FileList | undefined = undefined
	let pictureFiles: FileList | undefined = undefined

	async function resizePersonaPicture(p?: File) {
		try {
			picture = p
				? await clipAndResize(p, MAX_DIMENSIONS.PICTURE.width, MAX_DIMENSIONS.PICTURE.height)
				: picture
		} catch (error) {
			console.error(error)
		}
	}

	async function resizePersonaCover(c?: File) {
		try {
			cover = c
				? await clipAndResize(c, MAX_DIMENSIONS.COVER.width, MAX_DIMENSIONS.COVER.height)
				: cover
		} catch (error) {
			console.error(error)
		}
	}
	$: canEditPictures && resizePersonaPicture(pictureFiles && pictureFiles[0])
	$: canEditPictures && resizePersonaCover(coverFiles && coverFiles[0])
</script>

<div class="top">
	{#if cover}
		<div class="img">
			<img src={cover} alt="profile" />
		</div>
	{/if}
</div>
<div class="buttons">
	<Button icon={Undo} variant="overlay" on:click={onBack} />
	{#if canEditPictures}
		<InputFile
			icon={cover ? Renew : Image}
			variant="primary"
			label={cover ? 'Change cover' : 'Add cover'}
			bind:files={coverFiles}
		/>
	{:else}
		<slot name="button_top" />
	{/if}
</div>
<div class="avatar">
	{#if picture}
		<div class="img">
			<img src={picture} alt="profile" />
		</div>
		{#if canEditPictures}
			<div class="change">
				<InputFile icon={Renew} variant="primary" bind:files={pictureFiles} />
			</div>
		{/if}
		<div class="change">
			<InputFile icon={Renew} variant="primary" bind:files={pictureFiles} />
		</div>
	{:else if canEditPictures}
		<div class="empty">
			<InputFile icon={Image} variant="primary" label="Add picture" bind:files={pictureFiles} />
		</div>
	{/if}
</div>

<div>{name}</div>
<div>{pitch}</div>
<div>{description}</div>

<div class="buttons-bottom">
	<slot name="button_primary" />
	<slot name="button_other" />
</div>

<slot />

<style lang="scss">
	.top {
		position: absolute;
		aspect-ratio: 16/9;
		max-height: 342px;
		width: 100vw;
		background-color: #666666;
		z-index: -1;

		@media (min-width: 688px) {
			aspect-ratio: none;
			height: 342px;
		}

		.img {
			position: absolute;
			inset: 0 0 0 0;
			display: flex;
			justify-content: center;
			align-items: center;

			img {
				width: inherit;
				height: inherit;
				object-fit: cover;
			}
		}
	}

	.buttons {
		inset: 0 0 auto;
		padding: var(--spacing-24);
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		z-index: 1;

			@media (min-width: 688px) {
				padding: var(--spacing-48);
			}
	}

	.avatar {
		width: 100vw;
		aspect-ratio: 16/9;
		max-height: 360px;

		.img {
			aspect-ratio: 1;
			height: calc(calc(100vw / 1.777) - 68px);
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #c9c9c9;
			margin-inline: auto;

			@media (min-width: 608px) {
				height: 274px;
			}

			@media (min-width: 688px) {
				height: 250px;
			}
			img {
				aspect-ratio: 1;
				object-fit: cover;
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
	.buttons-bottom {
		position: relative;
		padding: 48px;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}
</style>
