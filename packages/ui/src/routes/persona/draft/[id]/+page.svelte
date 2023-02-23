<script lang="ts">
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Edit from '$lib/components/icons/edit.svelte'
	import Undo from '$lib/components/icons/undo.svelte'
	import Info from '$lib/components/icons/info.svelte'
	import Wallet from '$lib/components/icons/wallet.svelte'

	import Button from '$lib/components/button.svelte'
	import PersonaEditText from '$lib/components/persona_edit_text.svelte'
	import PersonaDetail from '$lib/components/persona_detail.svelte'
	import Post from '$lib/components/post.svelte'
	import PostNew from '$lib/components/post_new.svelte'
	import LearnMore from '$lib/components/learn-more.svelte'
	import Header from '$lib/components/header.svelte'
	import InfoScreen from '$lib/components/info_screen.svelte'

	import { personas } from '$lib/stores/persona'
	import { tokens } from '$lib/stores/tokens'
	import { profile } from '$lib/stores/profile'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'
	import { connectWallet } from '$lib/services'
	import { goto } from '$app/navigation'


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

	const handleConnect = async () => {
		try {
			const signer = await connectWallet()
			const address = await signer.getAddress()

			$profile = { signer, address }
		} catch (err) {
			console.error(err)
		}
	}

	let y: number
</script>

<svelte:window bind:scrollY={y} />

{#if persona === undefined}
	<div>No draft persona with id {personaIndex}</div>
{:else}
	<div class="info-banner">
		<Info />
		This persona is a draft (unpublished)
	</div>
	<div class={`header ${y > 0 ? 'scrolled' : ''}`}>
		<Header title={persona.name}>
			{#if $profile.signer !== undefined}				
				<Button
					variant="primary"					
					icon={Edit}
					on:click={() => goto(ROUTES.POST_NEW($page.params.id))}
				/>
			{:else}
				<Button
					variant="primary"
					icon={Wallet}
					on:click={() => handleConnect()}
				/>
			{/if}
		</Header>
	</div>
	{#if state === 'text'}
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

			<div class="container info">
				{#if persona.posts.length < PERSONA_LIMIT}
					<div class="icon-info">
						<Info size={32} />
					</div>
					<p class="h2">{persona.posts.length} out {PERSONA_LIMIT} seed posts added</p>
					<p>You need {PERSONA_LIMIT} seed posts to publish this persona.</p>
					<LearnMore href="/" />
				{:else}
					<div class="icon-success">
						<Checkmark size={32} />
					</div>
					<p>{PERSONA_LIMIT} out {PERSONA_LIMIT} seed posts added</p>
					<p>You can publish this persona.</p>
					<LearnMore href="/" />
				{/if}
			</div>
			<hr/>

			{#each persona.posts as post}
				<Post {post} />
			{:else}
				<div class="container info">
					<p>There are no posts yet</p>
				</div>
			{/each}
		</PersonaDetail>
	{:else if state === 'post_new'}
		<PostNew
			submit={(postText) => {
				persona.posts.push({ timestamp: Date.now(), text: postText })
				personas.updateDraft(personaIndex, persona)
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
					<LearnMore href="/" />
				</div>
				<div>
					<h1>Currently available</h1>
					<span>{$tokens.go} GO</span>
					<p>Until cycle ends.</p>

					<LearnMore href="/" />
				</div>
			{:else}
				<div>
					<h1>Sorry, you can’t publish now</h1>
					<p>You need {TOKEN_POST_COST} GO to publish a persona.</p>
					<LearnMore href="/" />
				</div>
				<div>
					<h1>Currently available</h1>
					<span>{$tokens.go} GO</span>
					<p>Until cycle ends.</p>

					<LearnMore href="/" />
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
				<LearnMore href="/" />
			</div>

			<svelte:fragment slot="buttons">
				<Button icon={Checkmark} variant="primary" label="Done" on:click={() => history.back()} />
			</svelte:fragment>
		</InfoScreen>
	{/if}
{/if}


<style lang="scss">
	.info-banner {
		position: sticky;
		inset: 0 0 auto;
		z-index: 100;
		background-color: var(--grey-200);
		padding: var(--spacing-12);		
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: row;
		gap: var(--spacing-6);
		font-size: 14px;
	}

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

	.container.info .h2 {
		margin-bottom: var(--spacing-12);
	}
	// .icon-info,
	.icon-success {
		position: relative;

		& :global() {
			fill: var(--color-body-bg);
		}

		&::before {
			position: absolute;
			content: "";
			inset: 2px auto auto;
			background-color: var(--color-success);
			border-radius: 50%;
			width: 28px;
			height: 28px;
			transform: translateX(2px);
			z-index: -1;
		}
	}
</style>
