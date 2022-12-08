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
	<div class="explanation">Connect a wallet to access or create your account.</div>
</div>

<style>
	.root {
		top: 0;
		left: 0;
		right: 0;
		/* background-color: var(--color-grey-background); */
		padding: var(--spacing-24) var(--spacing-12);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.explanation {
		margin-top: var(--spacing-12);
		font-size: 14;
		font-weight: 400;
	}
</style>
