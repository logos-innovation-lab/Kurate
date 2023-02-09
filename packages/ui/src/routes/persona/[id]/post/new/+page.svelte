<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import SendAltFilled from '$lib/components/icons/send-alt-filled.svelte'
	import InputString from '$lib/components/input-string.svelte'
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import {
		createIdentity,
		generateGroupProof,
		getContractGroup,
		getGlobalAnonymousFeed,
		getRandomExternalNullifier,
		joinGroupOffChain,
		joinGroupOnChain,
	} from '$lib/services/index'
	import { posts } from '$lib/stores/post'
	import { hashPost, createPost } from '$lib/services/posts'
	import { getWaku } from '$lib/services/waku'

	let cls: string | undefined = undefined
	export { cls as class }

	let postText = ''
	let x: number

	async function submit() {
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
				const txres = await joinGroupOnChain(globalAnonymousFeed, commitment)
				console.log(txres)
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
			goto(ROUTES.HOME)
		} catch (error) {
			console.error(error)
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
