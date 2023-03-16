<script lang="ts">
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import EditPersona from '$lib/components/icons/request-quote.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Info from '$lib/components/icons/information.svelte'
	import Launch from '$lib/components/icons/rocket.svelte'

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

	import { personas } from '$lib/stores/persona'
	import { tokens } from '$lib/stores/tokens'
	import { page } from '$app/stores'
	import TokenInfo from '$lib/components/token-info.svelte'
	import adapter from '$lib/adapters'
	import { profile } from '$lib/stores/profile'

	const PERSONA_LIMIT = 5
	const TOKEN_POST_COST = 10

	const personaIndex = Number($page.params.id)
	let persona = $personas.draft[personaIndex]

	let name = persona?.name
	let pitch = persona?.pitch
	let description = persona?.description

	let state: 'text' | 'posts' | 'post_new' | 'publish_warning' | 'publish_success' = 'posts'

	async function publishPersona() {
		if (!$profile.signer) return

		await adapter.publishPersona(persona, $profile.signer)
		state = 'publish_success'
	}

	let y: number
	export let onBack: () => unknown = () => history.back()
</script>

<svelte:window bind:scrollY={y} />

{#if persona === undefined}
	<div>No draft persona with id {personaIndex}</div>
{:else if state === 'text'}
	<PersonaEditText
		bind:name
		bind:pitch
		bind:description
		title="Edit Persona details"
		onSubmit={() => {
			persona.name = name
			persona.pitch = pitch
			persona.description = description
			adapter.updatePersonaDraft(personaIndex, persona)
			state = 'posts'
		}}
		onCancel={() => {
			state = 'posts'
		}}
	/>
{:else if state === 'posts'}
	<Banner icon={Info}>This is a preview of the Persona's page</Banner>
	<div class={`header ${y > 0 ? 'scrolled' : ''}`}>
		<Header title={persona.name} {onBack} />
	</div>
	<PersonaDetail
		name={persona.name}
		pitch={persona.pitch}
		description={persona.description}
		postsCount={persona.posts.length}
		participantsCount={1}
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
					icon={Launch}
					variant="primary"
					label="Publish Persona"
					on:click={() => (state = 'publish_warning')}
				/>
			{/if}
		</svelte:fragment>
		<Button
			slot="button_other"
			variant="secondary"
			label="Edit Persona details"
			icon={EditPersona}
			on:click={() => (state = 'text')}
		/>
		<Divider />
		<Container>
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
				<Post {post} />
			{/each}
		</Grid>
	</PersonaDetail>
{:else if state === 'post_new'}
	<PostNew
		submit={(text, images) => {
			persona.posts.push({ timestamp: Date.now(), text, images })
			adapter.updatePersonaDraft(personaIndex, persona)
			state = 'posts'
		}}
		label="Save seed post"
		onBack={() => (state = 'posts')}
	/>
{:else if state === 'publish_warning'}
	<InfoScreen
		title={$tokens.go >= TOKEN_POST_COST ? 'Publish Persona' : 'Not enough token'}
		onBack={() => history.back()}
	>
		{#if $tokens.go >= TOKEN_POST_COST}
			<div class="token-info">
				<div>
					<div class="icon">
						<Info size={32} />
					</div>
					<h2>This will use {TOKEN_POST_COST} GO</h2>
					<p>This Persona will be live, and everyone will be able to post with it.</p>
					<p><LearnMore href="/" /></p>
				</div>
				<TokenInfo
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
				<TokenInfo
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
				<Button variant="secondary" label="Nope" icon={Close} on:click={() => (state = 'text')} />
			{:else}
				<Button variant="secondary" label="Back" icon={Undo} on:click={() => (state = 'text')} />
			{/if}
		</svelte:fragment>
	</InfoScreen>
{:else}
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
			<Button icon={Checkmark} variant="primary" label="Done" on:click={() => history.back()} />
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
			// transform: translateX(2px);
			transform: translate(-4px, 0px);
			z-index: -1;
		}
	}
</style>
