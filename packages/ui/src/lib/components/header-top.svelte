<script lang="ts">
	import UserIcon from '$lib/components/icons/user.svelte'
	import Button from './button.svelte'

	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import Wallet from './icons/wallet.svelte'
	import Edit from './icons/edit.svelte'
	import UpToTop from './icons/up-to-top.svelte'


	let cls: string | undefined = undefined
	export { cls as class }

	let y: number
	export let loggedin: boolean | undefined = undefined

	function goTop() {
		document.body.scrollIntoView()
	}
</script>

<svelte:window bind:scrollY={y} />

<div class={`root ${y > 0 ? 'scrolled' : ''} ${cls}`}>
	<div class="header-content">
		<div class="header">
			<div class="header-title-wrap">
				<div class="top-button">
					<Button icon={UpToTop} on:click={goTop} />
				</div>
				<span class={` ${y > 0 ? 'subtitle' : 'header-title'} ${cls}`}>
					{y > 0 ? 'Public Timeline' : 'The Outlet'}
				</span>
			</div>


			<div class="btns">
				<div class="btn wallet">
					<Button
						icon={loggedin ? Edit : Wallet}
						variant="primary"
						on:click={() => goto(loggedin ? ROUTES.POST_NEW : ROUTES.PROFILE)}
					/>
				</div>
	
				<div class="btn user">
					<Button icon={UserIcon} 
						variant="secondary" 
						on:click={() => goto(ROUTES.PROFILE)} 
					/>
				</div>
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
			padding: 0 0 var(--spacing-24);
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
			margin-left: -56px;
			transition: margin 0.2s ease-in-out;

			.top-button {
				opacity: 0;
				transition: opacity 0.2s ease-in-out;
			}
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
			&.scrolled {
				box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
			}
		}
	}
	
</style>
