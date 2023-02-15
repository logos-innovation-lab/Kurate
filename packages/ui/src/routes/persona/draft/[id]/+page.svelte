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

	import { personas, type DraftPersona } from '$lib/stores/persona'

	import { ROUTES } from '$lib/routes'
	import { clipAndResize } from '$lib/utils/image'
	import { page } from '$app/stores'
	import Post from '$lib/components/post.svelte'
	import PostNew from '$lib/components/post_new.svelte'
	import { tokens } from '$lib/stores/tokens'

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
	const PERSONA_LIMIT = 5
	const TOKEN_POST_COST = 10

	function initializeState(persona: DraftPersona) {
		if (!persona?.description || !persona?.name || !persona?.pitch) {
			return 'text'
		}
		if (!persona?.cover || !persona?.picture) {
			return 'images'
		}
		return 'posts'
	}

	const personaIndex = Number($page.params.id)
	let persona = $personas.draft[personaIndex]
	let state:
		| 'text'
		| 'images'
		| 'confirmation'
		| 'posts'
		| 'post_new'
		| 'publish_warning'
		| 'publish_success' = initializeState(persona)

	$: console.log(state)

	let coverFiles: FileList | undefined = undefined
	let pictureFiles: FileList | undefined = undefined

	function publishPersona() {
		$tokens.go -= TOKEN_POST_COST
		state = 'publish_success'
	}

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
				<Button icon={Undo} variant="primary" on:click={() => (state = 'text')} />
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
		{:else if state === 'confirmation'}
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
					on:click={() => (state = 'posts')}
				/>
			</div>
		{:else if state === 'posts'}
			<div class="top">
				<div class="img">
					<img src={persona.cover} alt="profile" />
				</div>
			</div>
			<div class="buttons">
				<Button icon={Undo} variant="primary" on:click={() => (state = 'confirmation')} />
				{#if persona.posts.length < PERSONA_LIMIT}
					<Button
						icon={Edit}
						variant="primary"
						label="Write seed post"
						on:click={() => (state = 'post_new')}
					/>
				{:else}
					<Button
						icon={Edit}
						variant="primary"
						label="Publish persona"
						on:click={() => (state = 'publish_warning')}
					/>
				{/if}
			</div>
			<div class="avatar">
				<div class="img">
					<img src={persona.picture} alt="profile" />
				</div>
			</div>

			<div>{persona.name}</div>
			<div>{persona.pitch}</div>
			<div>{persona.description}</div>

			<div class="buttons-bottom">
				{#if persona.posts.length < PERSONA_LIMIT}
					<Button
						icon={Edit}
						variant="primary"
						label="Write seed post"
						on:click={() => (state = 'post_new')}
					/>
				{:else}
					<Button
						icon={Edit}
						variant="primary"
						label="Publish persona"
						on:click={() => (state = 'publish_warning')}
					/>
				{/if}
				<Button
					variant="secondary"
					label="Edit persona"
					icon={Edit}
					on:click={() => (state = 'text')}
				/>
			</div>

			{#if persona.posts.length < PERSONA_LIMIT}
				<p>{persona.posts.length} out {PERSONA_LIMIT} seed posts added</p>
				<p>You need {PERSONA_LIMIT} seed posts to publish this persona.</p>
				<a href="/" target="_blank">Learn more</a>
			{:else}
				<p>{PERSONA_LIMIT} out {PERSONA_LIMIT} seed posts added</p>
				<p>You can publish this persona.</p>
				<a href="/" target="_blank">Learn more</a>
			{/if}

			{#each persona.posts as post}
				<Post {post} />
			{:else}
				<p>There are no posts yet</p>
			{/each}
		{:else if state === 'post_new'}
			<PostNew
				submit={(postText) => {
					persona.posts.push({ timestamp: Date.now(), text: postText })
					state = 'posts'
				}}
				cancel={() => (state = 'posts')}
			/>
		{:else if state === 'publish_warning'}
			<div class="buttons">
				<Button icon={Undo} variant="primary" on:click={() => goto(ROUTES.HOME)} />
				<div>Publish persona</div>
				<div />
			</div>
			{#if $tokens.go >= TOKEN_POST_COST}
				<h1>This will use {TOKEN_POST_COST} GO</h1>
				<p>People will be able to post with this persona.</p>
				<a href="/" target="_blank">Learn more</a>

				<h1>Currently available</h1>
				<span>{$tokens.go} GO</span>
				<p>Until cycle ends.</p>

				<a href="/" target="_blank">Learn more</a>
			{:else}
				<h1>Sorry, you can’t publish now</h1>
				<p>You need {TOKEN_POST_COST} GO to publish a persona.</p>
				<a href="/" target="_blank">Learn more</a>

				<h1>Currently available</h1>
				<span>{$tokens.go} GO</span>
				<p>Until cycle ends.</p>

				<a href="/" target="_blank">Learn more</a>
			{/if}
			<div class="buttons-bottom">
				{#if $tokens.go >= TOKEN_POST_COST}
					<Button
						variant="secondary"
						label="Cancel"
						icon={Close}
						on:click={() => (state = 'text')}
					/>
					<Button icon={ArrowRight} variant="primary" label="Proceed" on:click={publishPersona} />
				{:else}
					<Button variant="secondary" label="Back" icon={Undo} on:click={() => (state = 'text')} />
				{/if}
			</div>
		{:else}
			<div class="buttons">
				<Button icon={Undo} variant="primary" on:click={() => (state = 'publish_warning')} />
				<div>Publish successful</div>
				<div />
			</div>

			<h1>This persona is now public</h1>
			<p>
				Anyone can now submit posts with this persona. All posts will be subject to community review
				before being published. This persona was added to your favorites on your homepage.
			</p>
			<a href="/" target="_blank">Learn more</a>

			<div class="buttons-bottom">
				<Button
					icon={Checkmark}
					variant="primary"
					label="Done"
					on:click={() => goto(ROUTES.HOME)}
				/>
			</div>
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
