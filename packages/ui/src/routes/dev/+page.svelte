<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Header from '$lib/components/header.svelte'
	import Container from '$lib/components/container.svelte'
	import Textarea from '$lib/components/textarea.svelte'
	import { tokens } from '$lib/stores/tokens'
	import Divider from '$lib/components/divider.svelte'
	import { onDestroy, onMount } from 'svelte'
	import adapter, { adapterName, adapters, type AdapterName } from '$lib/adapters'
	import Dropdown from '$lib/components/dropdown.svelte'
	import DropdownItem from '$lib/components/dropdown-item.svelte'
	import Select from '$lib/components/select.svelte'
	import { saveToLocalStorage } from '$lib/utils'

	function calculateTimeToEndEpoch() {
		return $tokens.epochDuration - (Date.now() % $tokens.epochDuration)
	}

	let goTokenValue = $tokens.go.toFixed()
	let repTokenValue = $tokens.repTotal.toFixed()
	let timeToEndEpoch: number = calculateTimeToEndEpoch()
	let interval: ReturnType<typeof setInterval>

	onMount(() => {
		interval = setInterval(() => {
			timeToEndEpoch = calculateTimeToEndEpoch()
		}, 1000)
	})

	onDestroy(() => {
		interval && clearInterval(interval)
	})

	function updateTokens() {
		tokens.update((tokens) => {
			tokens.go = parseInt(goTokenValue)
			tokens.repTotal = parseInt(repTokenValue)
			return tokens
		})
	}

	function changeAdapter(adapterName: AdapterName) {
		saveToLocalStorage('adapter', adapterName)
		location.reload()
	}
</script>

<Header title="DEV DASHBOARD" onBack={() => history.back()} />
<Container>
	<section>
		<h2>Adapter	</h2>
		<Dropdown>
			<Select slot="button" label="Reputation level" value={adapterName} />

			{#each adapters as adapter}
				<DropdownItem
					active={adapterName === adapter}
					onClick={() => changeAdapter(adapter)}>{adapter}</DropdownItem
				>
			{/each}
		</Dropdown>
	</section>
	<Divider />
	{#if adapterName === 'in-memory'}
		<section>
			<h2>Epoch</h2>
			<p>Epoch duration: {$tokens.epochDuration / 1000} seconds</p>
			<p>Time to end epoch: {(timeToEndEpoch / 1000).toFixed()} seconds</p>
			<Button label="Start new epoch" variant="primary" />
		</section>
		<Divider />
		<section>
			<Textarea label="Available GO token value" bind:value={goTokenValue} />
			<Textarea label="Total REP token" bind:value={repTokenValue} />
			<Button label="Update" on:click={updateTokens} />
		</section>
		<Divider />
		<section>
			<h2>GO historical values</h2>
			{#each $tokens.goHistoricalValues as transaction}
				<section>
					{transaction.timestamp}
					{transaction.value}
				</section>
			{/each}
		</section>
		<Divider />
		<section>
			<h2>REP staked historical values</h2>
			{#each $tokens.repStakedHistoricalValues as transaction}
				<section>
					{transaction.timestamp}
					{transaction.value}
				</section>
			{/each}
		</section>
		<Divider />
		<section>
			<h2>REP total historical values</h2>
			{#each $tokens.repTotalHistoricalValues as transaction}
				<section>
					{transaction.timestamp}
					{transaction.value}
				</section>
			{/each}
		</section>
	{/if}
</Container>

<style lang="scss">
	section {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
