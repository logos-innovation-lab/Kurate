<script lang="ts">
	import Button from './button.svelte'

	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import Wallet from './icons/wallet.svelte'
	import { formatAddress } from '$lib/utils/format'
	import adapter from '$lib/adapters'
	import { canConnectWallet } from '$lib/services'

	let cls: string | undefined = undefined
	export { cls as class }

	let y: number
	let clientHeight: number
	let topOffset: number
	let spacerElement: HTMLDivElement
	const PADDING_MAX = 48
	const PADDING_MIN = 12

	export let address: string | undefined = undefined
</script>

<svelte:window bind:scrollY={y} />

<header
	class={`root ${y > 0 ? 'scrolled' : ''} ${cls}`}
	style={`margin-top: ${topOffset}px; padding: ${
		Math.max(PADDING_MAX - PADDING_MIN - y / 2, 0) + PADDING_MIN
	}px`}
>
	<div class="content" bind:clientHeight>
		<h1 class={`title ${cls}`}>Kurate</h1>

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
					label={y === 0 ? 'Connect' : ''}
					on:click={adapter.signIn}
					disabled={!canConnectWallet()}
				/>
			{/if}
		</div>
	</div>
</header>
<div
	class="spacer"
	style={`height: ${clientHeight + PADDING_MAX * 2}px;`}
	bind:this={spacerElement}
/>

<style lang="scss">
	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(var(--blur));
		transition: box-shadow 0.2s;
		z-index: 100;

		.content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			transition: padding 0.2s;

			@media (min-width: 688px) {
				transition: padding 0.2s;
			}
		}

		.title {
			font-family: var(--font-body);
			font-weight: 600;
			font-size: 18px;
			font-style: normal;
			text-align: left;
		}

		&.scrolled {
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);
			transition: box-shadow 0.2s;

			.header-content {
				transition: padding 0.2s;
			}
			// @media (prefers-color-scheme: dark) {
			// 	box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			// }
		}
	}
</style>
