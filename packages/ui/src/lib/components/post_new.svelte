<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Image from '$lib/components/icons/image.svelte'
	// import SendAltFilled from '$lib/components/icons/send-alt-filled.svelte'
	// import InputString from '$lib/components/input-string.svelte'
	import Header from '$lib/components/header.svelte'
	import Textarea from '$lib/components/textarea.svelte'
	import { profile } from '$lib/stores/profile'

	let cls: string | undefined = undefined
	export { cls as class }
	export let submit: (postText: string) => void | Promise<void>
	// export let cancel: () => void
	export let label: string | undefined = 'Publish'

	let postText = ''
	let x: number
</script>

<svelte:window bind:innerWidth={x} />

<div class={`root ${cls}`}>
	<Header>
		<Button icon={Image}/>
		<Button 
			icon={Checkmark} 
			variant="primary" 
			label={label} 
			on:click={() => submit(postText)}
			disabled={!$profile.signer}
		/>
	</Header>
	<div class="post-content">
		<Textarea bind:value={postText} placeholder="Write here..." />
		<!-- <InputString bind:value={postText} placeholder="Write here..." autofocus /> -->
	</div>
</div>

<style lang="scss">
	// .header {
	// 	display: flex;
	// 	flex-direction: row;
	// 	justify-content: space-between;
	// 	align-items: center;
	// 	font-weight: 600;
	// 	padding: var(--spacing-12) var(--spacing-12) var(--spacing-24);
	// 	margin: 0 auto;
	// 	transition: padding 0.2s;
	// 	max-width: var(--container-width);

	// 	@media (min-width: 1280px) {
	// 		padding-top: var(--spacing-48);
	// 		transition: padding 0.2s;
	// 	}
	// }

	// .btns {
	// 	display: flex;
	// 	flex-direction: row;
	// 	gap: var(--spacing-12);
	// 	align-items: center;
	// }

	.post-content {
		// padding: var(--spacing-24) var(--spacing-12) var(--spacing-12);
		// height: calc(100vh - 80px);
		// text-align: center;
		max-width: 450px;
		margin-inline: auto;

		// @media (min-width: 1280px) {
		// 	height: calc(100vh - 116px);
		// }
	}
</style>
