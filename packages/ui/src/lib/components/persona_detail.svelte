<script lang="ts">
	import Image from '$lib/components/icons/image.svelte'
	import Renew from '$lib/components/icons/renew.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import UserMultiple from './icons/user-multiple.svelte'
	import Forum from './icons/forum.svelte'
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
	export let postsCount: number

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
			{#if canEditPictures}
				<div class="change">
					<InputFile icon={Renew} variant="primary" bind:files={pictureFiles} />
				</div>
			{/if}
			<div class="change">
				<InputFile icon={Renew} variant="primary" bind:files={pictureFiles} />
			</div>
		</div>
	{:else if canEditPictures}
		<div class="empty">
			<InputFile icon={Image} variant="primary" label="Add picture" bind:files={pictureFiles} />
		</div>
	{/if}
</div>

<div class="persona-info">
	<h1 class="name">{name}</h1>
	<div class="pitch">{pitch}</div>
	<div class="description">{description}</div>
	<div class="post-count">
		<div>
			<UserMultiple size={18} />
			{postsCount}
		</div>
		<div>
			<Forum size={18} />
			{postsCount}
		</div>
	</div>
</div>

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
		// aspect-ratio: 16/9;
		// max-height: 360px;
		position: relative;
		margin-bottom: var(--spacing-12);

		.img {
			aspect-ratio: 1;
			height: calc(calc(100vw / 1.777) - 68px);
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #c9c9c9;
			margin-inline: auto;
			position: relative;

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
		// .empty {
		// 	position: absolute;
		// 	// inset: auto auto 50%;
		// 	width: inherit;
		// 	height: inherit;
		// 	display: flex;
		// 	justify-content: center;
		// 	align-items: center;
		// }
		.emtpty,
		.change {
			position: absolute;
			inset: auto 50% 50%;
			transform: translate(-50%, 50%);
			width: fit-content;
			height: fit-content;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	.persona-info {
		text-align: center;
		padding-inline: var(--spacing-12);
		max-width: 738px;
		margin-inline: auto;
		// border-bottom: 1px solid var(--grey-200);
		.name,
		.pitch,
		.description {
			margin-bottom: var(--spacing-12);
		}

		// .pitch {

		// }

		.description {
			font-family: var(--font-serif);
		}
	}

	.post-count {
		font-size: 12px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		flex-wrap: nowrap;
		gap: var(--spacing-12);

		> div {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
			flex-wrap: nowrap;
			gap: var(--spacing-3);
		}
	}

	.buttons-bottom {
		position: relative;
		padding: var(--spacing-24) var(--spacing-12);
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-12);
		border-bottom: 1px solid var(--grey-200);
	}

	@media (prefers-color-scheme: dark) {
		.buttons-bottom {
			border-bottom: 1px solid var(--grey-500);
		}
	
	}

	.persona-info {
		text-align: center;
		.name {

		}

		.pitch {

		}

		.description {
			font-family: var(--font-serif);
		}
	}
</style>
