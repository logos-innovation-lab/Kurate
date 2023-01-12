<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
	export let value: string | undefined = undefined
	export let disabled: boolean | undefined = undefined
	export let placeholder: string | undefined = undefined
</script>

<textarea {placeholder} {disabled} bind:value class={`root ${cls}`} />

<style lang="scss">
	.root {
		border: none;
		font-family: var(--font-serif);
		font-size: 18px;
		background-color: transparent;
		width: 100%;
		height: 100%;

		&:disabled {
			cursor: not-allowed;
			opacity: 0.15;
		}

		&::placeholder {
			font-family: var(--font-serif);
			color: var(--grey-300);
			text-align: center;
		}
	}
</style>
