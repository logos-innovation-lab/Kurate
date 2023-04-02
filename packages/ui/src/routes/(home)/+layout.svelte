<script lang="ts">
	import HeaderTop from '$lib/components/header-top.svelte'
	import Divider from '$lib/components/divider.svelte'

	import { profile } from '$lib/stores/profile'
	import { chats } from '$lib/stores/chat'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { ROUTES } from '$lib/routes'

	let showChat: boolean
	$: showChat = $page.url.pathname.includes(ROUTES.CHATS)
</script>

<div>
	<HeaderTop address={$profile.address} />
	<div class="wrapper">
		{#if $profile.signer !== undefined}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="nav-wrapper">
				<nav class={showChat ? 'chats' : ''}>
					<div class={showChat ? '' : 'active'} on:click={() => goto(ROUTES.HOME)}>Personas</div>
					<div class={showChat ? 'active' : ''} on:click={() => goto(ROUTES.CHATS)}>
						Chats
						{#if $chats.unread > 0}
							<div class="unread">{$chats.unread}</div>
						{/if}
					</div>
				</nav>
			</div>
		{/if}
		<Divider visible="mobile" />

		<slot />
	</div>
</div>

<style lang="scss">
	.nav-wrapper {
		padding: 0 var(--spacing-24) var(--spacing-24);

		// @media (prefers-color-scheme: dark) {
		// 	border-bottom-color: var(--grey-500);
		// }

		@media (min-width: 688px) {
			padding: 0 var(--spacing-48) var(--spacing-48);
		}
	}

	nav {
		width: 100%;
		max-width: 450px;
		height: 50px;
		margin: auto;
		border-radius: 25px;
		background-color: var(--grey-200);
		display: flex;
		align-items: center;
		font-family: var(--font-body);
		font-size: var(--font-size-normal);
		font-weight: var(--font-weight-sb);
		border: solid 3px var(--grey-200);
		position: relative;

		// @media (prefers-color-scheme: dark) {
		// 	background-color: var(--grey-500);
		// 	border-color: var(--grey-500);
		// }

		&::before {
			content: '';
			position: absolute;
			inset: 0 50% 0 0;
			background-color: var(--color-body-bg);
			padding: 10px;
			border-radius: 25px;
			z-index: 0;
			transition: inset 0.3s;
		}

		&.chats::before {
			inset: 0 0 0 50%;
			transition: inset 0.3s;
		}

		div {
			padding: 10px;
			width: 50%;
			border-radius: 25px;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			z-index: 10;
		}

		.unread {
			background-color: var(--color-body-text);
			color: var(--color-body-bg);
			width: fit-content;
			height: 20px;
			padding: 0 7px;
			margin-left: var(--spacing-6);
			font-size: var(--font-size-xs);
			font-weight: var(--font-weight-sb);
			line-height: 20px;
		}
	}
</style>
