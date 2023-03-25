<script lang="ts">
	import Checkmark from '$lib/components/icons/checkmark.svelte'

	export let disabled = false
	export let danger = false
	export let active = false
	export let onClick: () => unknown
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	class={`${$$props.class} ${disabled ? 'disabled' : ''} ${danger ? 'danger' : ''}`}
	on:click={() => !disabled && onClick()}
>
	<slot />
	{#if active}
		<span class="selected">
			<Checkmark size={16} />
		</span>
	{/if}
</li>

<style lang="scss">
	li {
		padding: var(--spacing-12);
		list-style: none;
		cursor: pointer;
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-24);
		font-family: var(--font-serif);
		font-size: var(--font-size-lg);

		&.danger {
			color: var(--color-red);
		}

		&:hover {
			background-color: var(--grey-150);
		}

		&.disabled {
			color: var(--grey-200);
			cursor: not-allowed;
		}

		&:not(:last-child) {
			border-bottom: 1px solid var(--grey-200);

			// @media (prefers-color-scheme: dark) {
			// 	background-color: var(--grey-500);
			// }
		}

		.selected {
			display: flex;
			align-items: center;
		}
	}
</style>
