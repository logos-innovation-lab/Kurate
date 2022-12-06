<script lang="ts">
	export let title: string | undefined = undefined
</script>

<div class="root">
	<span class="title">{title}</span>
	<slot />
</div>

<style lang="scss">
	.root {
		padding: var(--spacing-12);
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--color-light-grey-background);
	}
	.title {
		margin-bottom: var(--spacing-6);
		font-family: var(--font-body);
		font-size: 14px;
		color: var(--color-grey-text);
	}
</style>
