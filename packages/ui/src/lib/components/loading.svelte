<script lang="ts">
	import Header from '$lib/components/header.svelte'

	let cls: string | undefined = undefined
	let y: number
	export { cls as class }
	export let title: string | undefined = undefined
	export let fullPage: boolean | undefined = undefined
	export let onBack: (() => unknown) | undefined = undefined
	export let onClose: (() => unknown) | undefined = undefined
</script>

<svelte:window bind:scrollY={y} />

{#if title}
	<Header {title} {onBack} {onClose} />
{/if}

<div class={`loading-screen ${y > 0 ? 'scrolled' : ''} ${fullPage ? 'full-page' : ''} ${cls}`}>
	<div class="loading">
		<div class="circle"></div>
		<div class="circle"></div>
		<div class="circle"></div>
	</div>
	<div class="title">
		<slot name="title" />
	</div>
	<div class="description">
		<slot name="description" />
	</div>
	<div class="btns">
		<slot name="buttons" />
	</div>
</div>

<style lang="scss">
	.loading-screen {		
		display: flex;
		align-items: stretch;
		justify-content: center;
		flex-direction: column;
		gap: var(--spacing-6);
		max-width: 498px;
		margin-inline: auto;
		padding: var(--spacing-24);
		text-align: center;

		&.full-page {
			min-height: calc(100dvh - 92px);
			min-height: calc(100vh - 92px);
			
			@media (min-width: 688px) {
				min-height: calc(100vh - 140px);
			}
			&.scrolled {
				min-height: calc(100vh - 68px);
			}
		}

		.loading {
			display: flex;
			gap: var(--spacing-6);
			justify-content: center;
			align-items: center;
			height: 32px;
			margin-bottom: var(--spacing-12);

			@keyframes loading-circle {
				0% {					
					width: var(--spacing-6);
					height: var(--spacing-6);
					background-color: var(--color-body-text);
				}
				50% {
					width: var(--spacing-3);
					height: var(--spacing-3);
					background-color: transparent;
				}
				100% {
					width: var(--spacing-6);
					height: var(--spacing-6);
					background-color: var(--color-body-text);
				}
			}

			.circle {
				position: relative;
				width: var(--spacing-6);

				&::before {
					position: absolute;
					inset: 50%;
					transform: translate(-50%, -50%);
					content: "";
					border-radius: 50%;
					animation-duration: 2.1s;
					animation-name: loading-circle;
					animation-iteration-count: infinite;
				}

				&:nth-child(2)::before {
					animation-delay: 0.7s;
				}

				&:nth-child(3)::before {
					animation-delay: 1.4s;
				}
			}
		}

		.title {
			font-size: var(--font-size-lg);
			font-weight: var(--font-weight-sb);
		}

		.btns {
			margin-top: var(--spacing-48);
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-12);
		}

		:global(.small) {
			font-size: var(--font-size-sm);
		}
	}
</style>
