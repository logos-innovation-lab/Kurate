<script lang="ts">
	import Textarea from '$lib/components/textarea.svelte'
	import Header from '$lib/components/header.svelte'

	let y: number

	export let name = ''
	export let pitch = ''
	export let description = ''
	export let title: string
	export let onBack: undefined | (() => unknown) = undefined
</script>

<svelte:window bind:scrollY={y} />

<Header {title} {onBack} />

<form>
	<Textarea placeholder="Enter a short memorable name…" label="Persona name" bind:value={name} />
	<Textarea
		placeholder="Pitch the persona in one sentence, this should serve as a brief introduction…"
		label="Persona pitch"
		bind:value={pitch}
	/>
	<Textarea
		placeholder="Describe the persona in more details, provide additional context and help anyone understand the concept of this persona…"
		label="Persona description"
		bind:value={description}
	/>

	<div class="btns">
		<slot />
	</div>
</form>

<style lang="scss">
	form {
		min-height: calc(100dvh - 92px);
		min-height: calc(100vh - 92px);
		display: flex;
		align-items: stretch;
		justify-content: center;
		flex-direction: column;
		gap: var(--spacing-48);
		max-width: 498px;
		margin-inline: auto;
		padding: var(--spacing-24);

		.btns {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-12);
			padding-top: var(--spacing-48);
		}
	}
</style>
