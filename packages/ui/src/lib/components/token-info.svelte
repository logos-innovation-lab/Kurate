<script lang="ts">
	import LearnMore from '$lib/components/learn-more.svelte'

	export let title: string
	export let amount: string
	export let tokenName: string
	export let explanation: string
	export let link = '' // FIXME: make this required when we have FAQ build
	export let error = false
</script>

<div class={`box ${error ? 'error' : ''}`}>
	<div class="h3">{title}</div>
	<div class="token-amt">{amount}</div>
	<div class="token">{tokenName}</div>
	<p>{explanation}</p>
	<LearnMore href={link} />
</div>

<style lang="scss">
	.box {
		border: 1px solid var(--grey-200);
		padding: var(--spacing-24);
		margin-top: var(--spacing-48);
		flex-basis: 100%;
		margin-left: 3px;
		margin-right: 3px;

		&.first-child {
			margin-left: 0px;
		}

		&.last-child {
			margin-right: 0px;
		}

		.token-amt {
			font-size: 40px;
			line-height: 1;
			font-weight: var(--font-weight-sb);
			margin-top: var(--spacing-12);
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
