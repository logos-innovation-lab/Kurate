<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
	export let value: string | undefined = undefined
	export let disabled: boolean | undefined = undefined
	export let placeholder: string | undefined = undefined
	export let autofocus = false
</script>

<!-- svelte-ignore a11y-autofocus -->
<textarea {placeholder} {disabled} bind:value class={`root ${cls}`} {autofocus} />

<style lang="scss">
	.root {
		border: none;
		font-family: var(--font-serif);
		font-size: 18px;
		background-color: transparent;
		width: 100%;
		max-width: 450px;
		height: 100%;
		outline: none;

		&:disabled {
			cursor: not-allowed;
			opacity: 0.15;
		}

		&::placeholder {
			font-family: var(--font-serif);
			color: var(--grey-300);
		}
	}
</style>
