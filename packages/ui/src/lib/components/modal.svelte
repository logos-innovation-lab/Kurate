<script lang="ts">
	import Button from './button.svelte'

	let cls: string | undefined = undefined
	export { cls as class }
	export let message: string
	export let action: (() => void) | undefined = undefined
</script>

<div class={`root ${cls}`}>
	<div>
		<p>{message}</p>
		{#if action !== undefined}
			<Button variant="secondary" label="OK" on:click={action} />
		{/if}
	</div>
</div>

<style lang="scss">
	.root {
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		padding-left: var(--spacing-12);
		padding-right: var(--spacing-12);
		background-color: #0005;
		z-index: 300;
		position: fixed;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.root div {
		background-color: white;
		padding: 50px;
	}
</style>
