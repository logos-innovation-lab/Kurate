<script lang="ts">
	import Button from './button.svelte'

	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import Wallet from './icons/wallet.svelte'
	import { formatAddress } from '$lib/utils'
	import { profile } from '$lib/stores/profile'
	import { connectWallet } from '$lib/services'

	let cls: string | undefined = undefined
	export { cls as class }

	let y: number
	export let address: string | undefined = undefined

	const handleConnect = async () => {
		try {
			const signer = await connectWallet()
			const address = await signer.getAddress()

			$profile = { signer, address }
		} catch (err) {
			console.error(err)
		}
	}
</script>

<svelte:window bind:scrollY={y} />

<header class={`root header-top ${y > 0 ? 'scrolled' : ''} ${cls}`}>
	<div class="header-content">
		<h1 class={`header-title ${cls}`}>Kurate</h1>

		<div class="btns">
			{#if address}
				<Button
					icon={Wallet}
					variant={'secondary'}
					label={formatAddress(address)}
					on:click={() => goto(ROUTES.PROFILE)}
				/>
			{:else}
				<Button
					icon={Wallet}
					variant={'primary'}
					label={'Connect'}
					on:click={() => handleConnect()}
				/>
			{/if}
		</div>
	</div>
</header>

<style lang="scss">
	header {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(3px);
		transition: box-shadow 0.2s;

		.header-content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: var(--spacing-24);
			// border-bottom: 1px solid var(--grey-200);
			transition: padding 0.2s;

			@media (min-width: 739px) {
				padding: var(--spacing-48);
				transition: padding 0.2s;
			}
		}

		.header-title {
			font-family: var(--font-body);
			font-weight: 600;
			font-size: 18px;
			font-style: normal;
			text-align: left;
		}

		&.scrolled {
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);
			// border-bottom: none;
			transition: box-shadow 0.2s;

			.header-content {
				@media (min-width: 739px) {
					padding-block: var(--spacing-24);
					transition: padding 0.2s;
				}
			}
		}

		@media (prefers-color-scheme: dark) {
			// border-bottom-color: var(--grey-500);
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
		}
	}
</style>
