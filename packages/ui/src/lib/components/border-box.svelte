<script lang="ts">
	import LearnMore from '$lib/components/learn-more.svelte'

	export let title: string | undefined = undefined
	export let amount: string | undefined = undefined
	export let tokenName: string | undefined = undefined
	export let explanation: string | undefined = undefined
	export let noGap: boolean | undefined = undefined
	export let link: string | undefined = undefined // FIXME: make this required when we have FAQ build
	export let error = false
</script>

<div class={`box ${error ? 'error' : ''} ${noGap ? '' : 'gap'}`}>
	{#if title}
		<div class="h3">{title}</div>
	{/if}
	{#if amount}
		<div class="token-amt">{amount}</div>
	{/if}
	{#if tokenName}
		<div class="token">{tokenName}</div>
	{/if}
	{#if explanation}
		<p>{explanation}</p>
	{/if}
	<slot />
	{#if link !== undefined}
		<LearnMore href={link} />
	{/if}
</div>

<style lang="scss">
	.box {
		border: 1px solid var(--grey-200);
		padding: var(--spacing-24);
		margin-top: var(--spacing-6);
		flex-basis: 100%;
		text-align: center;

		&.gap {
			margin-top: var(--spacing-48);
		}

		&.first-child {
			margin-left: 0px;
		}

		&.last-child {
			margin-right: 0px;
		}

		.h3,
		:global(h3) {
			margin-bottom: var(--spacing-12);
		}

		.token-amt {
			font-size: 40px;
			line-height: 1;
			font-weight: var(--font-weight-sb);
		}

		.token {
			text-transform: uppercase;
			font-weight: var(--font-weight-sb);
			margin-bottom: var(--spacing-12);
		}

		&.error {
			border: 1px solid var(--color-red);
			background-color: rgba(var(--color-red-rgb), 0.05);

			.token-amt,
			.token {
				color: var(--color-red);
			}
		}
	}
</style>
