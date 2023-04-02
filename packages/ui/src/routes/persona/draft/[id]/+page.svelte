<script lang="ts">
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import EditPersona from '$lib/components/icons/request-quote.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Info from '$lib/components/icons/information.svelte'
	import Launch from '$lib/components/icons/rocket.svelte'
	import TrashCan from '$lib/components/icons/trash-can.svelte'

	import Button from '$lib/components/button.svelte'
	import PersonaEditText from '$lib/components/persona_edit_text.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'
	import Post from '$lib/components/post.svelte'
	import PostNew from '$lib/components/post_new.svelte'
	import LearnMore from '$lib/components/learn-more.svelte'
	import Header from '$lib/components/header.svelte'
	import InfoScreen from '$lib/components/info_screen.svelte'
	import Banner from '$lib/components/message-banner.svelte'
	import Grid from '$lib/components/grid.svelte'
	import Container from '$lib/components/container.svelte'
	import InfoBox from '$lib/components/info-box.svelte'
	import Divider from '$lib/components/divider.svelte'
	import Spacer from '$lib/components/spacer.svelte'
	import PersonaEditRep from '$lib/components/persona_edit_rep.svelte'

	import { personas } from '$lib/stores/persona'
	import { tokens } from '$lib/stores/tokens'
	import type { DraftPost } from '$lib/stores/post'
	import { page } from '$app/stores'
	import BorderBox from '$lib/components/border-box.svelte'
	import adapter from '$lib/adapters'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'

	const PERSONA_LIMIT = 5
	const TOKEN_POST_COST = 10

	const personaIndex = Number($page.params.id)
	let persona = $personas.draft[personaIndex]

	let name = persona.name
	let pitch = persona.pitch
	let description = persona.description
	let minReputation = persona.minReputation
	let postToEdit: DraftPost | undefined = undefined
	let postToEditText = ''
	let postToEditImages: string[] = []
	let postToDelete: DraftPost | undefined = undefined
	let publishedPersonaId: string | undefined = undefined

	type State = 'persona_preview' | 'edit_text' | 'edit_rep' | 'post_new' | 'publish_warning'

	let showWarningDiscardModal = false
	let showWarningDeletePersona = false

	const setState = (newState: State) => {
		state = newState
	}

	let state: State = 'persona_preview'

	function onLeaveEdit() {
		if (
			name !== persona.name ||
			pitch !== persona.pitch ||
			description !== persona.description ||
			minReputation !== persona.minReputation
		) {
			showWarningDiscardModal = true
		} else {
			setState('persona_preview')
		}
	}

	async function publishPersona() {
		if (!$profile.signer) return

		publishedPersonaId = await adapter.publishPersona(persona, $profile.signer)
	}

	let y: number
</script>

<svelte:window bind:scrollY={y} />

{#if persona === undefined}
	<div>No draft persona with id {personaIndex}</div>
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
						postToEdit = undefined
						setState('persona_preview')
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
{:else if showWarningDeletePersona}
	<InfoScreen title="Delete persona">
		<InfoBox>
			<div class="icon">
				<Info size={32} />
			</div>
			<h2>Are you sure you want to delete this draft persona?</h2>
			<LearnMore href="/" />
			<svelte:fragment slot="buttons">
				<Button
					icon={Checkmark}
					variant="primary"
					label="Yes, delete persona"
					on:click={() => {
						adapter.deleteDraftPersona(personaIndex)
						goto(ROUTES.HOME)
					}}
				/>
				<Button
					variant="secondary"
					label="No, keep it"
					icon={Undo}
					on:click={() => (showWarningDeletePersona = false)}
				/>
			</svelte:fragment>
		</InfoBox>
	</InfoScreen>
{:else if postToDelete !== undefined}
	<InfoScreen title="Delete seed post">
		<InfoBox>
			<div class="icon">
				<Info size={32} />
			</div>
			<h2>Are you sure you want to delete this seed post?</h2>
			<LearnMore href="/" />
			<svelte:fragment slot="buttons">
				<Button
					icon={Checkmark}
					variant="primary"
					label="Delete seed post"
					on:click={() => {
						persona.posts = persona.posts.filter((p) => p !== postToDelete)
						adapter.updatePersonaDraft(personaIndex, persona)
						postToDelete = undefined
					}}
				/>
				<Button
					variant="secondary"
					label="Cancel"
					icon={Undo}
					on:click={() => (postToDelete = undefined)}
				/>
			</svelte:fragment>
		</InfoBox>
	</InfoScreen>
{:else if postToEdit !== undefined}
	<PostNew
		bind:postText={postToEditText}
		bind:images={postToEditImages}
		submit={(text, images) => {
			const psts = persona.posts.filter((p) => p !== postToEdit)
			persona.posts = [{ timestamp: Date.now(), text, images }, ...psts]
			adapter.updatePersonaDraft(personaIndex, persona)
			postToEdit = undefined
			state = 'persona_preview'
		}}
		label="Save seed post"
		onBack={(text, images) =>
			text !== postToEdit?.text ||
			images.some((img) => !postToEdit?.images.includes(img)) ||
			postToEdit.images.some((img) => !images.includes(img))
				? (showWarningDiscardModal = true)
				: (postToEdit = undefined)}
	/>
{:else if publishedPersonaId !== undefined}
	<InfoScreen title="Persona published">
		<div class="token-info">
			<div class="icon-success">
				<Checkmark />
			</div>
			<h2>This Persona is now public</h2>
			<p>
				Anyone can now submit posts with this Persona. All posts will be subject to community review
				before being published. This Persona was added to your favorites.
			</p>
			<LearnMore href="/" />
		</div>

		<svelte:fragment slot="buttons">
			<Button
				icon={Checkmark}
				variant="primary"
				label="Done"
				disabled={!publishedPersonaId}
				on:click={() => publishedPersonaId && goto(ROUTES.PERSONA(publishedPersonaId))}
			/>
		</svelte:fragment>
	</InfoScreen>
{:else if state === 'persona_preview'}
	<Banner icon={Info}>This is a preview of the Persona's page</Banner>
	<div class={`header ${y > 0 ? 'scrolled' : ''}`}>
		<Header title={persona.name} onBack={() => goto(ROUTES.HOME)} />
	</div>
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		postsCount={persona.posts.length}
		participantsCount={1}
		minReputation={persona.minReputation}
		bind:picture={persona.picture}
		bind:cover={persona.cover}
		canEditPictures
		onBack={() => goto(ROUTES.HOME)}
	>
		<svelte:fragment slot="button_primary">
			{#if persona.posts.length < PERSONA_LIMIT}
				<Button
					icon={Edit}
					variant="primary"
					label="Write seed post"
					on:click={() => setState('post_new')}
				/>
			{:else}
				<Button
					icon={Launch}
					variant="primary"
					label="Publish Persona"
					on:click={() => setState('publish_warning')}
				/>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="button_other">
			<Button
				variant="secondary"
				label="Edit Persona details"
				icon={EditPersona}
				on:click={() => {
					name = persona.name
					pitch = persona.pitch
					description = persona.description
					minReputation = persona.minReputation
					setState('edit_text')
				}}
			/>
			<Button
				variant="secondary"
				icon={TrashCan}
				on:click={() => (showWarningDeletePersona = true)}
			/>
		</svelte:fragment>
		<Divider />
		<Container>
			<Spacer />
			<InfoBox>
				{#if persona.posts.length < PERSONA_LIMIT}
					<div class="icon">
						<Info size={32} />
					</div>
					<p class="h2">{persona.posts.length} out {PERSONA_LIMIT} seed posts added</p>
					<p>You need {PERSONA_LIMIT} seed posts to publish this Persona.</p>
					<LearnMore href="/" />
				{:else}
					<div class="icon icon-success">
						<Checkmark />
					</div>
					<p>{PERSONA_LIMIT} out {PERSONA_LIMIT} seed posts added</p>
					<p>You can publish this Persona.</p>
					<LearnMore href="/" />
				{/if}
			</InfoBox>
		</Container>
		<Grid>
			{#each persona.posts as post}
				<Post {post}>
					<Button
						icon={Edit}
						variant="secondary"
						label="Edit post"
						on:click={() => {
							postToEditText = post.text
							postToEditImages = post.images
							postToEdit = post
						}}
					/>
					<Button
						icon={TrashCan}
						variant="secondary"
						on:click={() => {
							postToDelete = post
						}}
					/>
				</Post>
			{/each}
		</Grid>
	</PersonaDetail>
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
		onBack={() => setState('edit_text')}
		onClose={onLeaveEdit}
		onProceed={(minRep) => {
			persona.name = name
			persona.pitch = pitch
			persona.description = description
			persona.minReputation = minRep
			setState('persona_preview')
		}}
	/>
{:else if state === 'post_new'}
	<PostNew
		submit={(text, images) => {
			persona.posts = [{ timestamp: Date.now(), text, images }, ...persona.posts]
			adapter.updatePersonaDraft(personaIndex, persona)
			state = 'persona_preview'
		}}
		label="Save seed post"
		onBack={(hasContent) =>
			hasContent ? (showWarningDiscardModal = true) : setState('persona_preview')}
	/>
{:else if state === 'publish_warning'}
	<InfoScreen
		title={$tokens.go >= TOKEN_POST_COST ? 'Publish Persona' : 'Not enough token'}
		onBack={() => setState('persona_preview')}
	>
		{#if $tokens.go >= TOKEN_POST_COST}
			<div class="token-info">
				<div>
					<div class="icon">
						<Info size={32} />
					</div>
					<h2>This will use {TOKEN_POST_COST} GO</h2>
					<p>This Persona will be alive, and everyone will be able to play with it.</p>
					<p><LearnMore href="/" /></p>
				</div>
				<BorderBox
					title="Currently available"
					amount={$tokens.go.toFixed()}
					tokenName="GO"
					explanation="Until new cycle begins"
				/>
			</div>
		{:else}
			<div class="token-info">
				<div>
					<div class="icon">
						<Info size={32} />
					</div>
					<h2>Sorry, you can't publish now</h2>
					<p>You need {TOKEN_POST_COST} GO to publish a Persona.</p>
					<LearnMore href="/" />
				</div>
				<BorderBox
					title="Currently available"
					amount={$tokens.go.toFixed()}
					tokenName="GO"
					explanation="Until new cycle begins"
					error
				/>
			</div>
		{/if}

		<svelte:fragment slot="buttons">
			{#if $tokens.go >= TOKEN_POST_COST}
				<Button icon={Checkmark} variant="primary" label="I agree" on:click={publishPersona} />
				<Button
					variant="secondary"
					label="Nope"
					icon={Close}
					on:click={() => setState('persona_preview')}
				/>
			{:else}
				<Button
					variant="secondary"
					label="Back"
					icon={Undo}
					on:click={() => setState('persona_preview')}
				/>
			{/if}
		</svelte:fragment>
	</InfoScreen>
{/if}

<style lang="scss">
	.header {
		position: fixed;
		inset: -100% 0 auto;
		z-index: 50;
		transition: inset 0.5s;

		&.scrolled {
			inset: 44px 0 auto;
			transition: inset 0.3s;
		}
	}

	.token-info {
		text-align: center;

		.icon {
			margin-bottom: var(--spacing-12);
		}

		p,
		h2 {
			margin-bottom: var(--spacing-6);
		}
	}

	.icon-success {
		position: relative;
		display: inline-block;
		margin-bottom: var(--spacing-12);

		:global(svg) {
			fill: var(--color-body-bg);
		}

		:global(polygon) {
			stroke: #fff;
			stroke-width: 1px;
		}

		&::before {
			position: absolute;
			content: '';
			inset: -4px auto auto auto;
			background-color: var(--color-success);
			border-radius: 50%;
			width: 28px;
			height: 28px;
			transform: translate(-4px, 0px);
			z-index: -1;
		}
	}
</style>
