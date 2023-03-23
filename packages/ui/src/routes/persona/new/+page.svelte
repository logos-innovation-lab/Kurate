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

	let name = ''
	let pitch = ''
	let description = ''

	let state: 'add_text' | 'edit_text' | 'edit_images' | 'confirm' | 'discard_warning' | 'add_rep' =
		'add_text'
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
{:else if state === 'add_text'}
	<PersonaEditText
		bind:name={persona.name}
		bind:pitch={persona.pitch}
		bind:description={persona.description}
		title="Create Persona"
		onClose={() => {
			persona.name || persona.pitch || persona.description
				? (state = 'discard_warning')
				: history.back()
		}}
	>
		<Button
			label="Proceed"
			icon={Checkmark}
			variant="primary"
			disabled={!persona.name || !persona.pitch || !persona.description}
			on:click={() => {
				state = 'add_rep'
			}}
		/>

		<!-- <Button label="Cancel" icon={Close} on:click={onCancel} /> -->
	</PersonaEditText>
{:else if state === 'add_rep'}
	<InfoScreen
		title="Create Persona"
		onBack={() => (showWarningModal = false)}
		onClose={() => (showWarningModal = true)}
	>
		<Container>
			<h2>Reputation level</h2>
			+
			<p>
				Choose how much REP is needed to submit a post through this Persona. Higher values means a
				more reputable Persona, but accessible to less people.
			</p>

			<p class="small">
				You currently have 61 REP. You can't choose a reputation level above your current REP total.
			</p>
		</Container>
		<svelte:fragment slot="buttons">
			<Button
				variant="primary"
				label="Proceed"
				icon={Checkmark}
				on:click={() => (state = 'edit_images')}
			/>
		</svelte:fragment>
	</InfoScreen>
{:else if state === 'edit_text'}
	<PersonaEditText bind:name bind:pitch bind:description title="Edit Persona details">
		<Button
			label="Save edits"
			icon={Checkmark}
			variant="primary"
			disabled={persona.name === name &&
				persona.pitch === pitch &&
				persona.description === description}
			on:click={() => {
				persona.name = name
				persona.pitch = pitch
				persona.description = description
				state = 'edit_images'
			}}
		/>

		<Button
			label="Discard changes"
			icon={Close}
			on:click={() => {
				if (
					persona.name === name &&
					persona.pitch === pitch &&
					persona.description === description
				) {
					state = 'edit_images'
				} else {
					state = 'discard_warning'
				}
			}}
		/>
	</PersonaEditText>
{:else if state === 'discard_warning'}
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
					on:click={() => (state = 'edit_images')}
				/>
				<Button
					variant="secondary"
					label="Continue editing"
					icon={Undo}
					on:click={() => (state = 'edit_text')}
				/>
				<!-- <Button label="Leave Persona creation" icon={Close} on:click={onCancel} /> -->
			</svelte:fragment>
		</InfoBox>
	</InfoScreen>
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
		onBack={() => (showWarningModal = true)}
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
				state = 'edit_text'
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
