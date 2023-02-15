<script lang="ts">
	import { goto } from '$app/navigation'

	import Undo from '$lib/components/icons/undo.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Image from '$lib/components/icons/image.svelte'
	import Renew from '$lib/components/icons/renew.svelte'

	import Edit from '$lib/components/icons/edit.svelte'
	import InputFile from '$lib/components/input-file.svelte'
	import Button from '$lib/components/button.svelte'

	import { personas } from '$lib/stores/persona'

	import { ROUTES } from '$lib/routes'
	import { clipAndResize } from '$lib/utils/image'
	import { page } from '$app/stores'

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

	const personaIndex = Number($page.params.id)
	let persona = $personas.draft[personaIndex]
	let state: 'text' | 'images' | 'confirmation' | 'posts' = 'text'
	let index: number | undefined

	let coverFiles: FileList | undefined = undefined
	let pictureFiles: FileList | undefined = undefined

	async function resizePersonaPicture(picture?: File) {
		try {
			persona.picture = picture
				? await clipAndResize(picture, MAX_DIMENSIONS.PICTURE.width, MAX_DIMENSIONS.PICTURE.height)
				: persona.picture
		} catch (error) {
			console.error(error)
		}
	}

	async function resizePersonaCover(cover?: File) {
		try {
			persona.cover = cover
				? await clipAndResize(cover, MAX_DIMENSIONS.COVER.width, MAX_DIMENSIONS.COVER.height)
				: persona.cover
		} catch (error) {
			console.error(error)
		}
	}

	$: persona && resizePersonaPicture(pictureFiles && pictureFiles[0])
	$: persona && resizePersonaCover(coverFiles && coverFiles[0])
</script>

{#if persona === undefined}
	<div>No draft persona with id {personaIndex}</div>
{:else}
	<div class="wrapper">
		{#if state === 'text'}
			<div class="buttons">
				<Button icon={Undo} on:click={() => history.back()} />
			</div>
			<span>Create persona</span>

			<label>
				Persona name
				<input type="text" bind:value={persona.name} placeholder="Enter a short memorable name…" />
			</label>

			<label>
				Persona pitch
				<textarea bind:value={persona.pitch} />
			</label>

			<label>
				Persona description
				<textarea bind:value={persona.description} />
			</label>

			<div class="buttons-bottom">
				<Button label="Cancel" icon={Close} on:click={() => history.back()} />
				<Button
					label="Proceed"
					icon={ArrowRight}
					variant="primary"
					disabled={!persona.name || !persona.pitch || !persona.description}
					on:click={() => {
						state = 'images'
					}}
				/>
			</div>
		{:else if state === 'images'}
			<div class="top">
				{#if persona.cover}
					<div class="img">
						<img src={persona.cover} alt="profile" />
					</div>
				{/if}
			</div>
			<div class="buttons">
				<Button icon={Undo} variant="primary" on:click={() => goto(ROUTES.HOME)} />
				<InputFile
					icon={persona.cover ? Renew : Image}
					variant="primary"
					label={persona.cover ? 'Change cover' : 'Add cover'}
					bind:files={coverFiles}
				/>
			</div>
			<div class="avatar">
				{#if persona.picture}
					<div class="img">
						<img src={persona.picture} alt="profile" />
					</div>
					<div class="change">
						<InputFile icon={Renew} variant="primary" bind:files={pictureFiles} />
					</div>
				{:else}
					<div class="empty">
						<InputFile
							icon={Image}
							variant="primary"
							label="Add picture"
							bind:files={pictureFiles}
						/>
					</div>
				{/if}
			</div>

			<div>{persona.name}</div>
			<div>{persona.pitch}</div>
			<div>{persona.description}</div>

			<div class="buttons-bottom">
				<Button
					variant="secondary"
					label="Edit text"
					icon={Edit}
					on:click={() => (state = 'text')}
				/>
				<Button
					variant="primary"
					label="Save changes"
					icon={Checkmark}
					disabled={!persona.picture ||
						!persona.cover ||
						!persona.pitch ||
						!persona.description ||
						!persona.name}
					on:click={() => {
						personas.updateDraft(personaIndex, persona)

						state = 'confirmation'
					}}
				/>
			</div>

			<p>Please provide at least a cover image.</p>
			<a href="/" target="_blank">Learn more →</a>
		{:else if (state = 'confirmation')}
			<div class="buttons">
				<Button icon={Undo} variant="primary" on:click={() => (state = 'images')} />
			</div>
			<div>
				<h1>This persona is saved as a draft (not public)</h1>
				<p>
					You will see it on your homepage. Before you can make it public you will need to create 5
					“seed” posts. These posts should serve as inspiring examples for people willing to post
					with this persona.
				</p>
				<a href="/" target="_blank">Learn more</a>
			</div>
			<div class="buttons-bottom">
				<Button variant="secondary" label="Continue later" on:click={() => goto(ROUTES.HOME)} />
				<Button
					icon={ArrowRight}
					variant="primary"
					label="Proceed"
					on:click={() => {
						state = 'posts'
					}}
				/>
			</div>
		{:else}
			<div>Posts</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	.wrapper {
		display: flex;
		flex-direction: column;
	}
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

			img {
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

	.buttons-bottom {
		padding: 48px;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
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
			img {
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
