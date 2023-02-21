<script lang="ts">
	import { profile } from '$lib/stores/profile'
	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import PostNew from '$lib/components/post_new.svelte'
  import {page } from '$app/stores'
  import {createRLNProof, Post} from "zkitter-js";
  import {zkitter} from "$lib/stores/zkitter";

  async function submit(content: string) {
    try {
        const zkIdentity = $profile.zkIdentity
        const client = $zkitter.client

        if (!client) throw new Error('zkitter is not initialized')
        if (!zkIdentity) throw new Error('no zkIdentity')

        const post = new Post({
            type: 'POST' as any,
            subtype: '' as any,
            creator: '',
            payload: {
              content,
            },
        });

        const groupAdapter = client.services.groups.groups['kurate'];
        const groupId = $page.params.id
        const identityCommitment = zkIdentity.genIdentityCommitment()
        await groupAdapter.sync()
        // @ts-ignore
        const tree = await groupAdapter.tree(groupId)
        const merklePath = tree.createProof(tree.indexOf(identityCommitment))
        const proof = await createRLNProof(post.hash(), zkIdentity, merklePath)

        await client.services.pubsub.publish(post, {
          type: 'rln' as any,
          proof,
          groupId,
        })

        goto(ROUTES.HOME)
    } catch (error) {
        console.error(error)
    }
  }

  function cancel() {
    history.back()
  }
</script>

<PostNew {submit} {cancel} />
