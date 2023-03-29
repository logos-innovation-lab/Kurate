<script lang="ts">
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import Info from '$lib/components/icons/information.svelte'
	import Undo from '$lib/components/icons/undo.svelte'

	import Button from '$lib/components/button.svelte'
	import PersonaEditText from '$lib/components/persona_edit_text.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'
	import LearnMore from '$lib/components/learn-more.svelte'
	import Banner from '$lib/components/message-banner.svelte'
	import Container from '$lib/components/container.svelte'
	import InfoBox from '$lib/components/info-box.svelte'
	import InfoScreen from '$lib/components/info_screen.svelte'
	import PersonaEditRep from '$lib/components/persona_edit_rep.svelte'

	import { ROUTES } from '$lib/routes'
	import { goto } from '$app/navigation'
	import adapter from '$lib/adapters'
	import { tokens } from '$lib/stores/tokens'
	import type { Persona } from '$lib/stores/persona'
	import type { ReputationOptions } from '$lib/types'

	let persona: Omit<Persona, 'participantsCount' | 'postsCount' | 'personaId'> = {
		name: '',
		pitch: '',
		description: '',
		picture: '',
		cover: '',
		minReputation: 5,
	}

	let name = ''
	let pitch = ''
	let description = ''
	let minReputation: ReputationOptions = 5

	type State = 'add_text' | 'add_rep' | 'add_images' | 'edit_text' | 'edit_rep' | 'confirm'

	let state: State = 'add_text'
	let showWarningLeaveModal = false
	let showWarningDiscardModal = false
	let draftPersonaIndex: number | undefined

	const setState = (newState: State) => {
		state = newState
	}

	const goBack = () => {
		switch (state) {
			case 'add_rep':
				setState('add_text')
				break
			case 'add_images':
				setState('add_rep')
				break
			case 'edit_rep':
				setState('edit_text')
				break
		}
	}

	function onLeave() {
		if (
			persona.name !== '' ||
			persona.pitch !== '' ||
			persona.description !== '' ||
			persona.minReputation !== 5
		) {
			showWarningLeaveModal = true
		} else {
			history.back()
		}
	}

	function onLeaveEdit() {
		if (
			name !== persona.name ||
			pitch !== persona.pitch ||
			description !== persona.description ||
			minReputation !== persona.minReputation
		) {
			showWarningDiscardModal = true
		} else {
			setState('add_images')
		}
	}

	async function savePersona() {
		draftPersonaIndex = await adapter.addPersonaDraft({ ...persona, posts: [] })
		state = 'confirm'
	}
</script>

{#if showWarningLeaveModal}
	<InfoScreen title="Leaving Persona creation" onBack={() => (showWarningLeaveModal = false)}>
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
						on:click={() => (showWarningLeaveModal = false)}
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
{:else if showWarningDiscardModal}
	<InfoScreen title="Discard changes">
		<InfoBox>
			<div class="icon">
				<Info size={32} />
			</div>
			<h2>Discard changes?</h2>
			<LearnMore href="/" />
			<svelte:fragment slot="buttons">
				<Button
					icon={Checkmark}
					variant="primary"
					label="Discard changes"
					on:click={() => {
						setState('add_images')
						showWarningDiscardModal = false
					}}
				/>
				<Button
					variant="secondary"
					label="Continue editing"
					icon={Undo}
					on:click={() => (showWarningDiscardModal = false)}
				/>
			</svelte:fragment>
		</InfoBox>
	</InfoScreen>
{:else if state === 'add_text'}
	<PersonaEditText
		bind:name={persona.name}
		bind:pitch={persona.pitch}
		bind:description={persona.description}
		title="Create Persona"
		onClose={onLeave}
	>
		<Button
			label="Proceed"
			icon={Checkmark}
			variant="primary"
			disabled={!persona.name || !persona.pitch || !persona.description}
			on:click={() => setState('add_rep')}
		/>
	</PersonaEditText>
{:else if state === 'add_rep'}
	<PersonaEditRep
		minReputation={persona.minReputation}
		title="Create Persona"
		repTotal={$tokens.repTotal}
		onClose={onLeave}
		onBack={goBack}
		onProceed={() => {
			setState('add_images')
		}}
	/>
{:else if state === 'edit_text'}
	<PersonaEditText
		bind:name
		bind:pitch
		bind:description
		title="Edit Persona details"
		onClose={onLeaveEdit}
	>
		<Button
			label="Proceed"
			icon={Checkmark}
			variant="primary"
			disabled={name === '' || pitch === '' || description === ''}
			on:click={() => {
				setState('edit_rep')
			}}
		/>
	</PersonaEditText>
{:else if state === 'edit_rep'}
	<PersonaEditRep
		bind:minReputation
		title="Edit Persona details"
		repTotal={$tokens.repTotal}
		onBack={goBack}
		onClose={onLeaveEdit}
		onProceed={(minRep) => {
			persona.name = name
			persona.pitch = pitch
			persona.description = description
			persona.minReputation = minRep
			setState('add_images')
		}}
	/>
{:else if state === 'add_images'}
	<Banner icon={Info}>This is a preview of the Persona's page</Banner>
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		postsCount={0}
		participantsCount={1}
		minReputation={persona.minReputation}
		bind:picture={persona.picture}
		bind:cover={persona.cover}
		canEditPictures
		onBack={goBack}
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
			on:click={() => {
				name = persona.name
				pitch = persona.pitch
				description = persona.description
				minReputation = persona.minReputation
				setState('edit_text')
			}}
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
