<script lang="ts">
  import {profile} from '../../../../../lib/stores/profile'
  import PostNew from '../../../../../lib/components/post_new.svelte'
  import {page} from "../../../../../lib/stores/route";
  import {createRLNProof, Post} from "zkitter-js";
  import {zkitter} from "../../../../../lib/stores/zkitter";
  import goto from 'page';
  import {ROUTES} from "../../../../../lib/routes";

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
        const idCommitmentHex = '0x' + identityCommitment.toString(16)
        await groupAdapter.sync()
        // @ts-ignore
        const tree = await groupAdapter.tree(groupId)
        const merklePath = await tree.createProof(tree.indexOf(identityCommitment))
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
