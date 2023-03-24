<script lang="ts">
	import Checkmark from './icons/checkmark.svelte'
	import Button from '$lib/components/button.svelte'
	import InfoScreen from './info_screen.svelte'
	import Container from './container.svelte'
	import Dropdown from './dropdown.svelte'
	import DropdownItem from './dropdown-item.svelte'

	let y: number

	export let minReputation: 5 | 25 | 100 | 250 | 500
	export let repTotal: number
	export let title: string
	export let onBack: () => unknown
	export let onClose: () => unknown
	export let onProceed: (minReputation: 5 | 25 | 100 | 250 | 500) => unknown
</script>

<svelte:window bind:scrollY={y} />

<InfoScreen {title} {onBack} {onClose}>
	<Container>
		<h2>Reputation level</h2>
		<Dropdown label={`Minimum ${minReputation} REP`}>
			<DropdownItem
				disabled={repTotal < 5}
				active={minReputation === 5}
				on:click={() => (minReputation = 5)}>Minimum (5+ REP)</DropdownItem
			>
			<DropdownItem
				disabled={repTotal < 25}
				active={minReputation === 25}
				on:click={() => (minReputation = 25)}>Medium (25+ REP)</DropdownItem
			>
			<DropdownItem
				disabled={repTotal < 100}
				active={minReputation === 100}
				on:click={() => (minReputation = 100)}>High (100+ REP)</DropdownItem
			>
			<DropdownItem
				disabled={repTotal < 250}
				active={minReputation === 250}
				on:click={() => (minReputation = 250)}>Very high (250+ REP)</DropdownItem
			>
			<DropdownItem
				disabled={repTotal < 500}
				active={minReputation === 500}
				on:click={() => (minReputation = 500)}>Maximum (500+ REP)</DropdownItem
			>
		</Dropdown>
		<p>
			Choose how much REP is needed to submit a post through this Persona. Higher values means a
			more reputable Persona, but accessible to less people.
		</p>

		<p class="small">
			You currently have {repTotal} REP. You can't choose a reputation level above your current REP total.
		</p>
	</Container>
	<svelte:fragment slot="buttons">
		<Button
			variant="primary"
			label="Proceed"
			icon={Checkmark}
			on:click={() => onProceed(minReputation)}
		/>
	</svelte:fragment>
</InfoScreen>
