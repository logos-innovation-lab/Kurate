<script lang="ts">
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import Undo from '$lib/components/icons/undo.svelte'

	import Button from '$lib/components/button.svelte'
	import PersonaEditText from '$lib/components/persona_edit_text.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'
	import Post from '$lib/components/post.svelte'
	import PostNew from '$lib/components/post_new.svelte'

	import { personas } from '$lib/stores/persona'
	import { tokens } from '$lib/stores/tokens'

	import { page } from '$app/stores'
	import InfoScreen from '$lib/components/info_screen.svelte'

	const PERSONA_LIMIT = 5
	const TOKEN_POST_COST = 10

	const personaIndex = Number($page.params.id)
	let persona = $personas.draft[personaIndex]

	let name = persona?.name
	let pitch = persona?.pitch
	let description = persona?.description

	let state: 'text' | 'posts' | 'post_new' | 'publish_warning' | 'publish_success' = 'posts'

	function publishPersona() {
		$tokens.go -= TOKEN_POST_COST
		state = 'publish_success'
	}
</script>

{#if persona === undefined}
	<div>No draft persona with id {personaIndex}</div>
{:else if state === 'text'}
	<PersonaEditText
		bind:name
		bind:pitch
		bind:description
		title="Edit persona"
		onSubmit={() => {
			persona.name = name
			persona.pitch = pitch
			persona.description = description
			personas.updateDraft(personaIndex, persona)
			state = 'posts'
		}}
		onCancel={() => {
			state = 'posts'
		}}
	/>
{:else if state === 'posts'}
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		bind:picture={persona.picture}
		bind:cover={persona.cover}
		canEditPictures
		onBack={() => history.back()}
	>
		<svelte:fragment slot="button_primary">
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
		</svelte:fragment>
		<Button
			slot="button_other"
			variant="secondary"
			label="Edit persona"
			icon={Edit}
			on:click={() => (state = 'text')}
		/>

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
	</PersonaDetail>
{:else if state === 'post_new'}
	<PostNew
		submit={(postText) => {
			persona.posts.push({ timestamp: Date.now(), text: postText })
			state = 'posts'
		}}
		cancel={() => (state = 'posts')}
	/>
{:else if state === 'publish_warning'}
	<InfoScreen title="Publish persona" onBack={() => history.back()}>
		{#if $tokens.go >= TOKEN_POST_COST}
			<div>
				<h1>This will use {TOKEN_POST_COST} GO</h1>
				<p>People will be able to post with this persona.</p>
				<a href="/" target="_blank">Learn more</a>
			</div>
			<div>
				<h1>Currently available</h1>
				<span>{$tokens.go} GO</span>
				<p>Until cycle ends.</p>

				<a href="/" target="_blank">Learn more</a>
			</div>
		{:else}
			<div>
				<h1>Sorry, you can’t publish now</h1>
				<p>You need {TOKEN_POST_COST} GO to publish a persona.</p>
				<a href="/" target="_blank">Learn more</a>
			</div>
			<div>
				<h1>Currently available</h1>
				<span>{$tokens.go} GO</span>
				<p>Until cycle ends.</p>

				<a href="/" target="_blank">Learn more</a>
			</div>
		{/if}

		<svelte:fragment slot="buttons">
			{#if $tokens.go >= TOKEN_POST_COST}
				<Button variant="secondary" label="Cancel" icon={Close} on:click={() => (state = 'text')} />
				<Button icon={ArrowRight} variant="primary" label="Proceed" on:click={publishPersona} />
			{:else}
				<Button variant="secondary" label="Back" icon={Undo} on:click={() => (state = 'text')} />
			{/if}
		</svelte:fragment>
	</InfoScreen>
{:else}
	<InfoScreen title="Publish successful" onBack={() => history.back()}>
		<div>
			<h1>This persona is now public</h1>
			<p>
				Anyone can now submit posts with this persona. All posts will be subject to community review
				before being published. This persona was added to your favorites on your homepage.
			</p>
			<a href="/" target="_blank">Learn more</a>
		</div>

		<svelte:fragment slot="buttons">
			<Button icon={Checkmark} variant="primary" label="Done" on:click={() => history.back()} />
		</svelte:fragment>
	</InfoScreen>
{/if}

<style lang="scss">
</style>
