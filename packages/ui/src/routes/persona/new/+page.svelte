<script lang="ts">
	import PersonaEditText from '$lib/components/persona_edit_text.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'

	import Undo from '$lib/components/icons/undo.svelte'
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'

	import Button from '$lib/components/button.svelte'
	import { ROUTES } from '$lib/routes'
	import { goto } from '$app/navigation'
	import { personas } from '$lib/stores/persona'

	let persona = {
		name: '',
		pitch: '',
		description: '',
		picture: '',
		cover: '',
	}

	let state: 'edit_text' | 'edit_images' | 'confirm' = 'edit_text'
	let draftPersonaIndex: number | undefined

	function onCancel() {
		// TODO: there should be a blocking modal window that asks user if they are sure to exit and lose data
		history.back()
	}

	async function savePersona() {
		draftPersonaIndex = await personas.addDraft({ ...persona, posts: [] })
		state = 'confirm'
	}
</script>

{#if state === 'edit_text'}
	<PersonaEditText
		bind:name={persona.name}
		bind:pitch={persona.pitch}
		bind:description={persona.description}
		title="Create persona"
		onSubmit={() => {
			state = 'edit_images'
		}}
		{onCancel}
	/>
{:else if state === 'edit_images'}
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		bind:picture={persona.picture}
		bind:cover={persona.cover}
		canEditPictures
		onBack={() => {
			state = 'edit_text'
		}}
		onSubmit={savePersona}
		{onCancel}
	>
		<p>Please provide at least a cover image.</p>
		<a href="/" target="_blank">Learn more →</a>
	</PersonaDetail>
{:else}
	<div class="buttons">
		<Button icon={Undo} variant="primary" on:click={() => goto(ROUTES.HOME)} />
	</div>
	<div>
		<h1>This persona is saved as a draft (not public)</h1>
		<p>
			You will see it on your homepage. Before you can make it public you will need to create 5
			“seed” posts. These posts should serve as inspiring examples for people willing to post with
			this persona.
		</p>
		<a href="/" target="_blank">Learn more</a>
	</div>
	<div class="buttons-bottom">
		<Button variant="secondary" label="Continue later" on:click={() => goto(ROUTES.HOME)} />
		<Button
			icon={ArrowRight}
			variant="primary"
			label="Proceed"
			on:click={() =>
				draftPersonaIndex !== undefined && goto(ROUTES.PERSONA_DRAFT(draftPersonaIndex))}
		/>
	</div>
{/if}

<style lang="scss">
</style>
