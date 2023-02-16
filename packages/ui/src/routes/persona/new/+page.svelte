<script lang="ts">
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Edit from '$lib/components/icons/edit.svelte'

	import Button from '$lib/components/button.svelte'
	import PersonaEditText from '$lib/components/persona_edit_text.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'

	import { ROUTES } from '$lib/routes'
	import { goto } from '$app/navigation'
	import { personas } from '$lib/stores/persona'
	import InfoScreen from '$lib/components/info_screen.svelte'

	let persona = {
		name: '',
		pitch: '',
		description: '',
		picture: '',
		cover: '',
	}

	let state: 'edit_text' | 'edit_images' | 'confirm' = 'edit_text'
	let showWarningModal = false
	let draftPersonaIndex: number | undefined

	function onCancel() {
		showWarningModal = true
	}

	async function savePersona() {
		draftPersonaIndex = await personas.addDraft({ ...persona, posts: [] })
		state = 'confirm'
	}
</script>

{#if showWarningModal}
	<InfoScreen title="Leaving persona creation" onBack={() => (showWarningModal = false)}>
		<div>
			<h1>Are you sure you want to leave?</h1>
			<p>
				You are about to leave the persona creation screenWARNING: If you do so, all changes will be
				lost.
			</p>
		</div>

		<svelte:fragment slot="buttons">
			<Button
				variant="secondary"
				label="Cancel"
				icon={Close}
				on:click={() => (showWarningModal = false)}
			/>
			<Button icon={ArrowRight} variant="primary" label="Leave" on:click={() => history.back()} />
		</svelte:fragment>
	</InfoScreen>
{:else if state === 'edit_text'}
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
	>
		<Button
			slot="button_primary"
			variant="secondary"
			label="Edit text"
			icon={Edit}
			on:click={onCancel}
		/>
		<Button
			slot="button_other"
			variant="primary"
			label="Save changes"
			icon={Checkmark}
			disabled={!persona.picture || !persona.cover}
			on:click={savePersona}
		/>
		<p>Please provide at least a cover image.</p>
		<a href="/" target="_blank">Learn more →</a>
	</PersonaDetail>
{:else}
	<InfoScreen title="All changes saved">
		<div>
			<h1>This persona is saved as a draft (not public)</h1>
			<p>
				You will see it on your homepage. Before you can make it public you will need to create 5
				“seed” posts. These posts should serve as inspiring examples for people willing to post with
				this persona.
			</p>
			<a href="/" target="_blank">Learn more</a>
		</div>
		<svelte:fragment slot="buttons">
			<Button variant="secondary" label="Continue later" on:click={() => history.back()} />
			<Button
				icon={ArrowRight}
				variant="primary"
				label="Proceed"
				on:click={() =>
					draftPersonaIndex !== undefined && goto(ROUTES.PERSONA_DRAFT(draftPersonaIndex))}
			/>
		</svelte:fragment>
	</InfoScreen>
{/if}

<style lang="scss">
</style>
