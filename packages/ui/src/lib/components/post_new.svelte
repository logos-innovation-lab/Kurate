<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Image from '$lib/components/icons/image.svelte'
	import Header from '$lib/components/header.svelte'
	import Textarea from '$lib/components/textarea.svelte'
	import { profile } from '$lib/stores/profile'

	let cls: string | undefined = undefined
	export { cls as class }
	export let submit: (postText: string) => unknown
	export let onBack: () => unknown = () => history.back()
	export let label: string | undefined = 'Publish'

	let postText = ''
	let x: number
</script>

<svelte:window bind:innerWidth={x} />

<div class={`root ${cls}`}>
	<Header {onBack}>
		<Button icon={Image} />
		<Button
			icon={Checkmark}
			variant="primary"
			{label}
			on:click={() => submit(postText)}
			disabled={!$profile.signer}
		/>
	</Header>
	<div class="post-content">
		<Textarea bind:value={postText} placeholder="Write here..." autofocus />
	</div>
</div>

<style lang="scss">
	.post-content {
		max-width: 450px;
		margin-inline: auto;
	}
</style>
