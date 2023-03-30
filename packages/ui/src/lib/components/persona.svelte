<script lang="ts">
	import Card from '$lib/components/grid-card.svelte'
	import UserMultiple from './icons/user-multiple.svelte'
	import Forum from './icons/forum.svelte'
	import adapter from '$lib/adapters'
	import type { ReputationOptions } from '$lib/types'

	export let name: string | undefined
	export let pitch: string | undefined
	export let postsCount: number
	export let participantsCount: number
	export let picture: string | undefined
	export let minReputation: ReputationOptions
	export let noHover: boolean | undefined = undefined
	export let noBorder: boolean | undefined = undefined
</script>

<Card on:click {noHover} {noBorder}>
	<div class="picture">
		<img src={picture ? adapter.getPicture(picture) : undefined} alt="persona" />
	</div>
	<div class="details">
		<div class="header">{name}</div>
		<div class="description">{pitch}</div>
		<div class="post-count">
			<div class="rep">
				REP {minReputation}+
			</div>
			<div>
				<UserMultiple size={18} />
				{participantsCount}
			</div>
			<div>
				<Forum size={18} />
				{postsCount}
			</div>
		</div>
	</div>
</Card>

<style lang="scss">
	.picture {
		flex: 0 0 92px;
		aspect-ratio: 1;

		@media (min-width: 398px) {
			flex-basis: 99px;
		}

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-8);
		min-height: 92px;

		@media (min-width: 398px) {
			min-height: 99px;
		}

		.header {
			font-size: 16px;
			font-weight: 600;
		}

		.description {
			font-size: 14px;
			flex-grow: 1;
		}

		.post-count {
			font-size: 12px;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-start;
			flex-wrap: nowrap;
			gap: var(--spacing-12);

			> div {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: flex-start;
				flex-wrap: nowrap;
				gap: var(--spacing-3);
			}

			.rep {
				background-color: var(--grey-200);
				border-radius: 9px;
				font-size: var(--font-size-sm);
				font-weight: var(--font-weight-sb);
				padding-left: var(--spacing-6);
				padding-right: var(--spacing-4);
				padding-top: 1px;
			}
		}
	}
</style>
