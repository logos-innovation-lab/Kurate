<script lang="ts">
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import Info from '$lib/components/icons/information.svelte'

	import Button from '$lib/components/button.svelte'
	import PersonaEditText from '$lib/components/persona_edit_text.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'
	import LearnMore from '$lib/components/learn-more.svelte'
	import Banner from '$lib/components/message-banner.svelte'
	import Container from '$lib/components/container.svelte'
	import InfoBox from '$lib/components/info-box.svelte'
	import InfoScreen from '$lib/components/info_screen.svelte'

	import { ROUTES } from '$lib/routes'
	import { goto } from '$app/navigation'
	import adapter from '$lib/adapters'

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
		draftPersonaIndex = await adapter.addPersonaDraft({ ...persona, posts: [] })
		state = 'confirm'
	}
</script>

{#if showWarningModal}
	<InfoScreen title="Leaving Persona creation" onBack={() => (showWarningModal = false)}>
		<Container>
			<InfoBox>
				<div class="icon">
					<Info size={32} />
				</div>
				<h2>Are you sure you want to leave?</h2>
				<p>You are about to leave the persona creation screen.</p>
				<p>WARNING: If you do so, all changes will be lost.</p>
				<svelte:fragment slot="buttons">
					<Button
						variant="secondary"
						label="Cancel"
						icon={Close}
						on:click={() => (showWarningModal = false)}
					/>
					<Button
						icon={ArrowRight}
						variant="primary"
						label="Leave"
						on:click={() => history.back()}
					/>
				</svelte:fragment>
			</InfoBox>
		</Container>
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
		onBack={onCancel}
		{onCancel}
	/>
{:else if state === 'edit_images'}
	<Banner icon={Info}>This is a preview of the Persona's page</Banner>
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		postsCount={0}
		participantsCount={1}
		bind:picture={persona.picture}
		bind:cover={persona.cover}
		canEditPictures
		onBack={() => {
			state = 'edit_text'
		}}
	>
		<Button
			slot="button_primary"
			variant="primary"
			label="Save Persona"
			icon={Checkmark}
			disabled={!persona.picture || !persona.cover}
			on:click={savePersona}
		/>
		<Button
			slot="button_other"
			variant="secondary"
			label="Edit Persona details"
			icon={Edit}
			on:click={() => (state = 'edit_text')}
		/>
		<Container>
			<InfoBox>
				<p>Please provide a profile picture and a cover image.</p>
			</InfoBox>
		</Container>
	</PersonaDetail>
{:else}
	<InfoScreen title="All changes saved">
		<Container>
			<InfoBox>
				<div class="icon">
					<Info size={32} />
				</div>
				<h2>This persona is saved as a draft (not public)</h2>
				<p>
					You will see it on your homepage. Before you can make it public you will need to create 5
					“seed” posts. These posts should serve as inspiring examples for people willing to post
					with this persona.
				</p>
				<LearnMore href="/" />
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
			</InfoBox>
		</Container>
	</InfoScreen>
{/if}
