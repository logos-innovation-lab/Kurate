<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import SendAltFilled from '$lib/components/icons/send-alt-filled.svelte'
	import InputString from '$lib/components/input-string.svelte'
	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import {
		generateGroupProof,
		getContractGroup,
		getGlobalAnonymousFeed,
		getRandomExternalNullifier,
		validateProofOnChain,
	} from '$lib/services/zk'

	import { profile } from '$lib/stores/profile'
	import { posts } from '$lib/stores/post'
	import { errors } from '$lib/stores/errors'

	import type { ErrorWithCode } from '$lib/types'

	let cls: string | undefined = undefined
	export { cls as class }

	let postText = ''
	let x: number

	async function submit() {
		try {
			const signer = $profile.signer
			if (!signer)
				throw new Error(
					'Failed to post - could not connect to web3 wallet. Try and refresh the page.',
				)

			const identity = $profile.identities.anonymous
			if (!identity)
				throw new Error('Failed to post - no identity found. Try and refresh the page.')

			const globalAnonymousFeed = getGlobalAnonymousFeed(signer)
			const group = await getContractGroup(globalAnonymousFeed)

			const externalNullifier = getRandomExternalNullifier()
			const proof = await generateGroupProof(group, identity, postText, externalNullifier)

			const tx = await validateProofOnChain(globalAnonymousFeed, proof, postText, externalNullifier)

			const res = await tx.wait()

			posts.add({
				timestamp: Date.now(),
				text: postText,
				tx: res.transactionHash,
			})
			goto(ROUTES.HOME)
		} catch (error) {
			if ((error as ErrorWithCode)?.code === 'ACTION_REJECTED') {
				errors.add(
					new Error(
						"You've rejected the post transaction. If you still want to publish your post, press publish button again.",
					),
				)
			} else {
				errors.add(error as Error)
			}
		}
	}
</script>

<svelte:window bind:innerWidth={x} />

<div class={`root ${cls}`}>
	<div class="header">
		<div>Create post</div>
		<div class="btns">
			<Button
				variant="secondary"
				icon={Close}
				label={x < 1280 ? '' : 'Cancel'}
				on:click={() => history.back()}
			/>
			<Button
				variant="primary"
				label="Publish"
				icon={SendAltFilled}
				on:click={submit}
				disabled={!$profile.signer}
			/>
		</div>
	</div>
	<div class="post-content">
		<InputString bind:value={postText} placeholder="Write here..." autofocus />
	</div>
</div>

<style lang="scss">
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
		padding: var(--spacing-12) var(--spacing-12) var(--spacing-24);
		margin: 0 auto;
		transition: padding 0.2s;
		max-width: var(--container-width);

		@media (min-width: 1280px) {
			padding-top: var(--spacing-48);
			transition: padding 0.2s;
		}
	}

	.btns {
		display: flex;
		flex-direction: row;
		gap: var(--spacing-12);
		align-items: center;
	}

	.post-content {
		padding: var(--spacing-24) var(--spacing-12) var(--spacing-12);
		height: calc(100vh - 80px);
		text-align: center;

		@media (min-width: 1280px) {
			height: calc(100vh - 116px);
		}
	}
</style>
