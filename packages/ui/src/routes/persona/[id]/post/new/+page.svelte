<script lang="ts">
	import { profile } from '$lib/stores/profile'
	import {
		createIdentity,
		generateGroupProof,
		getContractGroup,
		getGlobalAnonymousFeed,
		getRandomExternalNullifier,
		joinGroupOffChain,
		joinGroupOnChain,
	} from '$lib/services/index'

	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Close from '$lib/components/icons/close.svelte'

	import { posts } from '$lib/stores/post'
	import { hashPost, createPost } from '$lib/services/posts'
	import { getWaku } from '$lib/services/waku'
	import PostNew from '$lib/components/post_new.svelte'
	import InfoScreen from '$lib/components/info_screen.svelte'
	import Info from '$lib/components/icons/information.svelte'
	import LearnMore from '$lib/components/learn-more.svelte'
	import Button from '$lib/components/button.svelte'
	import { tokens } from '$lib/stores/tokens'
	import TokenInfo from '$lib/components/token-info.svelte'
	import Undo from '$lib/components/icons/undo.svelte'

	// FIXME: These should come from some constants
	const TOKEN_POST_COST_REP = 5
	const TOKEN_POST_COST_GO = 5

	// FIXME: This should be stored in persona and loaded
	const TOKEN_POST_MIN_REP = 5

	async function submit(postText: string) {
		try {
			const signer = $profile.signer
			if (!signer) throw new Error('no signer')

			const defaultIdentity = 'anonymous'

			const identity = await createIdentity(signer, defaultIdentity)

			const globalAnonymousFeed = getGlobalAnonymousFeed(signer)
			const group = await getContractGroup(globalAnonymousFeed)

			const commitment = identity.commitment

			if (!group.members.includes(commitment)) {
				joinGroupOffChain(group, commitment)
				await joinGroupOnChain(globalAnonymousFeed, commitment)
			}

			const post = { text: postText }
			const signal = hashPost(post)

			const externalNullifier = getRandomExternalNullifier()
			const proof = await generateGroupProof(group, identity, signal, externalNullifier)

			const waku = await getWaku()
			await createPost(waku, post, proof)

			posts.add({
				timestamp: Date.now(),
				text: postText,
			})
			state = 'post_submitted'
		} catch (error) {
			console.error(error)
		}
	}

	function onBack() {
		history.back()
	}

	let state: 'price_varning' | 'edit' | 'post_submitted' = 'price_varning'
</script>

{#if state === 'price_varning'}
	{#if $tokens.repTotal < TOKEN_POST_MIN_REP}
		<InfoScreen title="Not enough REP" {onBack}>
			<div class="token-info">
				<div>
					<div class="icon">
						<Info size={32} />
					</div>
					<h2>Sorry, you can't submit a post now</h2>
					<p>You need at least {TOKEN_POST_MIN_REP} REP to submit a post through this Persona.</p>
					<LearnMore href="/" />
				</div>
				<TokenInfo
					title="Available to stake"
					amount={$tokens.repTotal.toFixed()}
					tokenName="REP"
					explanation={`Including staked`}
					error
				/>
			</div>
			<svelte:fragment slot="buttons">
				<Button label="Back" icon={Undo} on:click={onBack} />
			</svelte:fragment>
		</InfoScreen>
	{:else if $tokens.go < TOKEN_POST_COST_GO || $tokens.repTotal - $tokens.repStaked < TOKEN_POST_COST_REP}
		<InfoScreen title="Not enough token" {onBack}>
			<div class="token-info">
				<div>
					<div class="icon">
						<Info size={32} />
					</div>
					<h2>Sorry, you can't submit a post now</h2>
					<p>
						You need {TOKEN_POST_COST_REP} REP to stake and {TOKEN_POST_COST_GO} GO to submit a post.
					</p>
					<LearnMore href="/" />
				</div>
				<div class="side-by-side">
					<TokenInfo
						title="Available to stake"
						amount={($tokens.repTotal - $tokens.repStaked).toFixed()}
						tokenName="REP"
						explanation={`${$tokens.repStaked} out of ${$tokens.repTotal} staked`}
						error={$tokens.repTotal - $tokens.repStaked < TOKEN_POST_COST_REP}
					/>
					<TokenInfo
						title="Currently available"
						amount={$tokens.go.toFixed()}
						tokenName="GO"
						explanation="Until new cycle begins"
						error={$tokens.go < TOKEN_POST_COST_GO}
					/>
				</div>
			</div>
			<svelte:fragment slot="buttons">
				<Button label="Back" icon={Undo} on:click={onBack} />
			</svelte:fragment>
		</InfoScreen>
	{:else}
		<InfoScreen title="Submit Post" {onBack}>
			<div class="token-info">
				<div>
					<div class="icon">
						<Info size={32} />
					</div>
					<h2>This will stake {TOKEN_POST_COST_REP} REP and use {TOKEN_POST_COST_GO} GO</h2>
					<p>
						Your post will be submitted to a community vote, and will be published if the majority
						votes to promote it. If promoted, you will earn {TOKEN_POST_COST_REP} REP. If demoted, you
						will lose your staked REP.
					</p>
					<p><LearnMore href="/" /></p>
				</div>
				<div class="side-by-side">
					<TokenInfo
						title="Available to stake"
						amount={($tokens.repTotal - $tokens.repStaked).toFixed()}
						tokenName="REP"
						explanation={`${$tokens.repStaked} out of ${$tokens.repTotal} staked`}
					/>
					<TokenInfo
						title="Currently available"
						amount={$tokens.go.toFixed()}
						tokenName="GO"
						explanation="Until new cycle begins"
					/>
				</div>
			</div>
			<svelte:fragment slot="buttons">
				<Button
					label="I agree"
					variant="primary"
					icon={Checkmark}
					on:click={() => (state = 'edit')}
				/>
				<Button label="Nope" icon={Close} on:click={onBack} />
			</svelte:fragment>
		</InfoScreen>
	{/if}
{:else if state === 'edit'}
	<PostNew {submit} {onBack} />
{:else}
	<InfoScreen title="Post submitted">
		<div class="token-info">
			<div class="icon-success">
				<Checkmark />
			</div>
			<h2>Your post is now pending review</h2>
			<p>
				Your post has been added to "Persona name's" pending list for community review. If it gets
				promoted it will be automatically published to "Persona name's" page when the new epoch
				begins.
			</p>
			<LearnMore href="/" />
		</div>

		<svelte:fragment slot="buttons">
			<Button icon={Checkmark} variant="primary" label="Done" on:click={() => history.back()} />
		</svelte:fragment>
	</InfoScreen>
{/if}

<style lang="scss">
	.side-by-side {
		display: flex;
		flex-direction: row;
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
			inset: -4px auto auto -6px;
			background-color: var(--color-success);
			border-radius: 50%;
			width: 28px;
			height: 28px;
			transform: translateX(2px);
			z-index: -1;
		}
	}
</style>
