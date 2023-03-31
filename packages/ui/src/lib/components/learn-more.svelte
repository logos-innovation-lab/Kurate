<script lang="ts">
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'

	export let href: string | undefined = undefined
	export let target: string | undefined = '_blank'
	export let arrow: boolean | undefined = undefined
</script>

{#if href}
	<a class="root" {href} {target}>
		Learn more
		{#if arrow === true}
			<ArrowRight size={12} />
		{/if}
	</a>
{/if}

<style lang="scss">
	.root {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
		flex-wrap: nowrap;
		gap: 3px;
	}
</style>
