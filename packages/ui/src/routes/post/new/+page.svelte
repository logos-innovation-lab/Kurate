<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import SendAltFilled from '$lib/components/icons/send-alt-filled.svelte'
	import InputString from '$lib/components/input-string.svelte'
	import { profile } from '$lib/stores/profile'
	import { posts } from '$lib/stores/post'
	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'

	let postText = ''

	function submit() {
		if (!$profile.key?.publicKey) return

		posts.add({
			timestamp: Date.now(),
			text: postText,
			user: { address: $profile.key.publicKey },
		})
		goto(ROUTES.HOME)
	}
</script>

<div>
	<div>Create post</div>
	<div>
		<Button variant="secondary" label="Cancel" icon={Close} on:click={() => history.back()} />
		<Button
			variant="primary"
			label="Post"
			icon={SendAltFilled}
			on:click={submit}
			disabled={!$profile.key?.publicKey}
		/>
	</div>
</div>

<InputString bind:value={postText} placeholder="Write here..." />

<style lang="scss">
</style>
