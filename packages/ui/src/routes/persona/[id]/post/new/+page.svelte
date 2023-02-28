<script lang="ts">
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
	import PostNew from '$lib/components/post_new.svelte'

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

<PostNew {submit} />
