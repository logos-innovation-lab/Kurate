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

<div class={`root header-top ${y > 0 ? 'scrolled' : ''} ${cls}`}>
	<div class="header-content">
		<div class="header">
			<div class="header-title-wrap">
				<span class={`header-title ${cls}`}>Kurate</span>
			</div>

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
	</div>
</div>

<style lang="scss">
	.root {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		padding: var(--spacing-12);
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(3px);
		transition: padding 0.2s;

		@media (min-width: 1280px) {
			border-bottom: none;
			padding-bottom: 0;
			padding-top: var(--spacing-48);
			transition: padding 0.2s;
		}

		.header-content {
			max-width: 1280px;
			margin: 0 auto 0;

			@media (min-width: 1280px) {
				padding-bottom: var(--spacing-12);
				transition: padding 0.2s;
			}
		}

		.btns {
			position: relative;
			height: 44px;

			.btn {
				position: absolute;
				top: 0;
				right: 0;

				&.user {
					opacity: 1;
					transition: opacity 0.2s ease-in-out;
					z-index: 10;
				}

				&.wallet {
					opacity: 0;
					transition: opacity 0.2s ease-in-out;
					z-index: 1;
				}
			}
		}

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0;
			transition: padding 0.2s ease-in-out;
		}

		.header-title {
			font-family: var(--font-body);
			font-weight: 600;
			font-size: 18px;
			font-style: normal;
			text-align: left;
		}

		.header-title-wrap {
			display: flex;
			flex-direction: row;
			align-items: center;
			gap: var(--spacing-12);
			transition: margin 0.2s ease-in-out;
		}

		&.scrolled {
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);

			@media (min-width: 1280px) {
				padding: var(--spacing-12);
				transition: padding 0.2s;

				.header-content {
					border-bottom: none;
					padding-bottom: 0;
					transition: padding 0.2s;
				}
			}

			.btn.user {
				opacity: 0;
				transition: opacity 0.2s ease-in-out;
				z-index: 1;
			}

			.btn.wallet {
				opacity: 1;
				transition: opacity 0.2s ease-in-out;
				z-index: 10;
			}

			.header {
				padding-bottom: 0;
				transition: padding 0.2s ease-in-out;
			}

			.header-title-wrap {
				margin-left: 0;
				transition: margin 0.2s ease-in-out;

				.top-button {
					opacity: 1;
					transition: opacity 0.2s ease-in-out;
				}
			}
		}

		@media (prefers-color-scheme: dark) {
			border-bottom-color: var(--grey-500);
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
		}
	}
</style>
