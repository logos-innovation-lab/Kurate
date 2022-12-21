<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }
	export let value: string | undefined = undefined
	export let disabled: boolean | undefined = undefined
	export let placeholder: string | undefined = undefined
</script>

<input type="text" {placeholder} {disabled} bind:value class={`root ${cls}`} />

<style lang="scss">
	.root {
		border: none;
		font-family: var(--font-serif);
		font-size: 18px;
		background-color: transparent;

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
