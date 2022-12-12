<script lang="ts">
	import { goto } from '$app/navigation'
	import Button from './button.svelte'
	import WalletIcon from './icons/wallet.svelte'

	let cls: string | undefined = undefined
	export { cls as class }
</script>

<div class={`root ${cls}`}>
	<Button
		icon={WalletIcon}
		variant="primary"
		label="Connect wallet to post"
		on:click={() => goto('/profile')}
	/>
	<div class="description">Connect a wallet to access or create your account.</div>
</div>

<style lang="scss">

	/* Instead of having this block have a top and/or bottom border, 
	we only have a bottom border here. This is because this block is used in 2 scenarios:
	on the Posts timeline page and the Account page. 
	On the Posts timeline page, the header section should have a border-bottom for scroll,
	and on the Account page, there's no content below this section which could 
	contain the next border. */

	.root {
		top: 0;
		left: 0;
		right: 0;
		padding: var(--spacing-24) var(--spacing-12);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-bottom: 1px solid var(--grey-200);
		
		@media (prefers-color-scheme: dark) {
			border-bottom-color: var(--grey-500);
		}
	}
	.description {
		margin-top: var(--spacing-12);
		font-size: var(--font-size-sm);
		font-weight: 400;
		text-align: center;
	}
</style>
