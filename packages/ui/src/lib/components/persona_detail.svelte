<script lang="ts">
	import Image from '$lib/components/icons/image.svelte'
	import Renew from '$lib/components/icons/renew.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import UserMultiple from './icons/user-multiple.svelte'
	import Forum from './icons/forum.svelte'
	import Profile from '$lib/components/profile-default.svelte'
	import Button from '$lib/components/button.svelte'
	import InputFile from '$lib/components/input-file.svelte'
	import Container from '$lib/components/container.svelte'

	import { clipAndResize } from '$lib/utils/image'
	import { MAX_DIMENSIONS } from '$lib/constants'
	import adapter from '$lib/adapters'

	export let name: string
	export let pitch: string
	export let description: string
	export let onBack: () => unknown = () => history.back()
	export let picture: string | undefined
	export let cover: string | undefined
	export let canEditPictures = false
	export let postsCount: number
	export let participantsCount: number
	export let minReputation: 5 | 25 | 100 | 250 | 500

	let coverFiles: FileList | undefined = undefined
	let pictureFiles: FileList | undefined = undefined

	async function resizePersonaPicture(p?: File) {
		try {
			picture = p
				? await adapter.uploadPicture(
						await clipAndResize(p, MAX_DIMENSIONS.PICTURE.width, MAX_DIMENSIONS.PICTURE.height),
				  )
				: picture
		} catch (error) {
			console.error(error)
		}
	}

	async function resizePersonaCover(c?: File) {
		try {
			cover = c
				? await adapter.uploadPicture(
						await clipAndResize(c, MAX_DIMENSIONS.COVER.width, MAX_DIMENSIONS.COVER.height),
				  )
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
			<img src={adapter.getPicture(cover)} alt="profile" />
		</div>
	{/if}
</div>
<div class="buttons">
	<Button icon={Undo} variant="overlay" on:click={onBack} />
	{#if canEditPictures}
		<InputFile
			icon={cover ? Renew : Image}
			variant="overlay"
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
			<img src={adapter.getPicture(picture)} alt="profile" />
			{#if canEditPictures}
				<div class="change">
					<InputFile icon={Renew} variant="overlay" bind:files={pictureFiles} />
				</div>
			{/if}
		</div>
	{:else if canEditPictures}
		<div class="no-img">
			<div class="empty">
				<InputFile icon={Image} variant="overlay" label="Add profile" bind:files={pictureFiles} />
			</div>
			<div class="profile-default">
				<Profile />
			</div>
		</div>
	{/if}
</div>

<Container>
	<div class="persona-info">
		<h1 class="name">{name}</h1>
		<div class="pitch">{pitch}</div>
		<div class="description">{description}</div>
		<div class="post-count">
			<div>
				REP {minReputation}+
			</div>
			<div>
				<UserMultiple size={18} />
				{participantsCount}
			</div>
			<div>
				<Forum size={18} />
				{postsCount}
			</div>
		</div>
	</div>
</Container>

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
		overflow: hidden;

		@media (min-width: 608px) {
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
				width: 100%;
				object-fit: cover;
			}
		}
	}

	.buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-24);
		transition: padding 0.2s;

		@media (min-width: 688px) {
			padding: var(--spacing-48);
			transition: padding 0.2s;
		}
	}

	.avatar {
		width: 100vw;
		position: relative;
		margin-bottom: var(--spacing-12);

		.no-img,
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

		.empty,
		.change {
			position: absolute;
			inset: auto var(--spacing-12) var(--spacing-12) auto;
			transform: none;
			width: max-content;
			height: fit-content;
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 10;
		}

		.profile-default {
			position: relative;
			width: 100%;
			height: 100%;

			:global(svg) {
				fill: var(--grey-300);
				position: absolute;
				inset: auto;
			}
			// :global(svg path) {
			// 	width: 100%;
			// 	height: 100%;
			// }
		}
	}

	.persona-info {
		text-align: center;
		max-width: 738px;
		margin-inline: auto;
		.name,
		.pitch,
		.description {
			margin-bottom: var(--spacing-12);
			max-width: 498px;
			margin-inline: auto;
		}

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
		padding: var(--spacing-24);
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-12);
		flex-wrap: wrap;

		@media (min-width: 688px) {
			padding: var(--spacing-48);
		}
	}

	// @media (prefers-color-scheme: dark) {
	// 	.buttons-bottom {
	// 		border-bottom: 1px solid var(--grey-500);
	// 	}
	// }
</style>
