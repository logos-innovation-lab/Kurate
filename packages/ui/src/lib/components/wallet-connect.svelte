<script lang="ts">
	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import Button from './button.svelte'
	import WalletIcon from './icons/wallet.svelte'

	let cls: string | undefined = undefined
	let y: number
	export { cls as class }
</script>

<svelte:window bind:scrollY={y} />
<div class={`root ${y > 0 ? 'scrolled' : ''} ${cls}`}>
	<Button
		icon={WalletIcon}
		variant="primary"
		label="Connect wallet to post"
		on:click={() => goto(ROUTES.PROFILE)}
	/>
	<div class="description">Connect a wallet to access or create your account.</div>
</div>

<style lang="scss">
	.root {
		top: 0;
		left: 0;
		right: 0;
		padding: var(--spacing-24) var(--spacing-12);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-top: 1px solid var(--grey-200);
		border-bottom: 1px solid var(--grey-200);
		transition: height 0.2s, padding 0.2s, margin 0.2s, font-size 0.2s;

		@media (min-width: 640px) {
			border-bottom: none;
		}
		@media (min-width: 1280px) {			
			border: none;
			outline: 1px solid var(--grey-200);
			outline-offset: -0.5px;
		}
		
		@media (prefers-color-scheme: dark) {
			border-top-color: var(--grey-500);
			border-left-color: var(--grey-500);
			border-right-color: var(--grey-500);
			outline-color: var(--grey-500);
		}
	}
	.description {
		margin-top: var(--spacing-12);
		font-size: var(--font-size-sm);
		font-weight: 400;
		text-align: center;
	}
</style>
