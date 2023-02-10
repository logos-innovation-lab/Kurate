<script lang="ts">
	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'
	import { profile } from '$lib/stores/profile'
	import Button from './button.svelte'
	import Add from '$lib/components/icons/add.svelte'
	import Search from '$lib/components/icons/search.svelte'
	import Cancel from '$lib/components/icons/close.svelte'
	import SettingsView from '$lib/components/icons/settings-view.svelte'
	import Dropdown from '$lib/components/icons/settings-view.svelte'

	let filterQuery = ''
	let isFocused = false

	export let placeholder: string | undefined = 'Search...'
	export let filterTitle: string | undefined = 'Personas'
	export let activeFilter: string | undefined = 'All'

	const toggleDropdown = () => {
		const dropdown = <HTMLElement>document.querySelector('.filter-dropdown')
		if (dropdown.style.display == 'block') {
			dropdown.style.display = 'none'
		} else {
			dropdown.style.display = 'block'
		}
		console.log('toggled')
	}
</script>

<div class="root">
	{#if $profile.signer === undefined}
		<hr />
	{/if}
	<div class="filter-wrap">
		<div class="filter">
			<!-- MAKE SURE {currentFilter} GETS REPLACED BY WHATEVER IS SELECTED IN THE DROPDOWN -->

			<div class="filter-title">{activeFilter} {filterTitle}</div>
			<div class="filter-btns">
				{#if $profile.signer !== undefined}
					<!-- THIS BUTTON CHANGES DEPENDING ON THE PAGE IT'S IN. IT CAN BE ADD A POST, START A CHAT, CREATE PERSONA -->

					<Button icon={Add} label="Create persona" on:click={() => goto(ROUTES.PERSONA_NEW)} />
				{/if}

				<!-- THIS BUTTON OPENS UP A DROPDOWN, IT'S EITHER A COMPONENT (IF ALL DROPDOWNS ARE THE SAME) OR A SLOT -->

				<Button icon={SettingsView} on:click={toggleDropdown} />
				<div class="filter-dropdown">
					<Dropdown>
						<slot />
					</Dropdown>
				</div>
			</div>
		</div>
		<div class="search-field">
			<div class="search-icon">
				<Search />
			</div>
			<input
				bind:value={filterQuery}
				{placeholder}
				on:focus={() => {
					isFocused = true
				}}
				on:blur={() => {
					isFocused = false
				}}
			/>
			{#if isFocused}
				<!-- NEEDS ACTION TO CLEAR INPUT FIELD -->

				<div class="cancel-wrapper">
					<Cancel />
				</div>
			{/if}
		</div>
	</div>
	<hr />
</div>

<style lang="scss">
	hr {
		@media (min-width: 688px) {
			display: none;
		}
	}

	.filter-wrap {
		padding: var(--spacing-24);
		transition: padding 0.2s;
		max-width: 498px;
		margin-inline: auto;

		@media (min-width: 688px) {
			max-width: 996px;
			padding-inline: var(--spacing-48);
			padding-bottom: var(--spacing-12);
		}

		@media (min-width: 1242px) {
			max-width: 1494px;
		}

		@media (min-width: 1640px) {
			max-width: 1992px;
		}

		@media (min-width: 2038px) {
			max-width: 2490px;
		}

		.filter {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;
			margin-bottom: var(--spacing-12);

			.filter-title {
				border-bottom: none;
			}

			@media (min-width: 688px) {
				margin-bottom: var(--spacing-24);
			}

			.filter-btns {
				display: flex;
				justify-content: space-between;
				align-items: center;
				flex-direction: row;
				flex-wrap: nowrap;
				gap: var(--spacing-12);
				position: relative;

				.filter-dropdown {
					position: absolute;
					inset: 100% 0 auto auto;
					min-width: min(calc(100vw - 48px), 250px);
					max-width: max(calc(100vw - 48px), 450px);
					background-color: green;
					display: none;
					z-index: 10;
				}
			}
		}

		.search-field {
			display: flex;
			align-items: center;
			flex-direction: row;
			flex-wrap: nowrap;
			gap: var(--spacing-6);
			margin-inline: -24px;
			padding-inline: var(--spacing-24);
			width: calc(100% + 48px);
			position: relative;
			transition: padding 0.2s, width 0.2s;

			.search-icon {
				flex-shrink: 0;
			}

			input {
				border: none;
				font-family: var(--font-serif);
				font-size: 18px;
				background-color: transparent;
				width: 100%;
				outline: none;
				padding-block: var(--spacing-12);
				position: relative;
				transition: padding 0.2s;

				&:disabled {
					cursor: not-allowed;
					opacity: 0.15;
				}

				&::placeholder {
					font-family: var(--font-serif);
					color: var(--grey-300);
				}

				&:focus,
				&:active {
					padding-block: var(--spacing-24);
					transition: padding 0.2s;
				}
			}

			&:focus-within {
				background-color: var(--grey-150);

				&::after {
					position: absolute;
					content: url(icons/close.svelte);
					inset: 24px 24px auto auto;
				}
			}

			.cancel-wrapper {
				cursor: pointer;
			}
		}
	}
</style>
