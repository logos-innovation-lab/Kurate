<script lang="ts">
	export let variant: 'light' | 'dark' = 'light'
</script>

<button class={`${variant} root`}>
	<slot />
</button>

<style>
	.root {
		padding: 15px;
		border: 1px solid var(--color-black);
		border-radius: 50px;
		cursor: pointer;
		transition: 1s;
	}
	.light,
	.dark:hover {
		color: var(--color-black);
		background-color: var(--color-white);
		border-color: var(--color-light-grey);
	}

	.dark,
	.light:hover {
		color: var(--color-white);
		background-color: var(--color-black);
		border-color: var(--color-light-black);
	}
</style>
