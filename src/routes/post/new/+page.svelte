<script lang="ts">
	import Avatar from '$lib/components/avatar.svelte'
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import SendAltFilled from '$lib/components/icons/send-alt-filled.svelte'
	import InputString from '$lib/components/input-string.svelte'
	import { profile } from '$lib/stores/profile'
	import { posts } from '$lib/stores/post'
	import { goto } from '$app/navigation'
	import Collaborate from '$lib/components/icons/collaborate.svelte'
	import { ROUTES } from '$lib/routes'

	let postText = ''

	function submit() {
		if (!$profile.active) return

		posts.add({
			timestamp: Date.now(),
			text: postText,
			user: $profile.active,
		})
		goto(ROUTES.HOME)
	}
</script>

<div>
	<div>Create post</div>
	<div>
		<Button variant="secondary" label="Cancel" icon={Close} on:click={() => history.back()} />
		<Button variant="primary" label="Post" icon={SendAltFilled} on:click={submit} />
	</div>
</div>

<div>
	<Avatar src={$profile.active?.avatar} on:click={() => goto(ROUTES.PROFILE)} />
	<div>{$profile.active?.name}</div>
	<div>{$profile.active?.address}</div>
	<Button variant="secondary" icon={Collaborate} on:click={() => goto(ROUTES.PROFILE)} />
</div>

<InputString bind:value={postText} placeholder="Write here..." />

<style lang="scss">
</style>
