<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Header from '$lib/components/header.svelte'
	import Container from '$lib/components/container.svelte'
	import Textarea from '$lib/components/textarea.svelte'
	import { tokens } from '$lib/stores/tokens'
	import Divider from '$lib/components/divider.svelte'
	import { adapterName, adapters, type AdapterName } from '$lib/adapters'
	import Dropdown from '$lib/components/dropdown.svelte'
	import DropdownItem from '$lib/components/dropdown-item.svelte'
	import Select from '$lib/components/select.svelte'
	import { saveToLocalStorage } from '$lib/utils'
	import { startNewEpoch } from '$lib/adapters/in-memory-and-ipfs'

	let goTokenValue = $tokens.go.toFixed()
	let repTokenValue = $tokens.repTotal.toFixed()

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
		<Dropdown>
			<Select slot="button" label="Adapter" value={adapterName} />

			{#each adapters as adapter}
				<DropdownItem active={adapterName === adapter} onClick={() => changeAdapter(adapter)}
					>{adapter}</DropdownItem
				>
			{/each}
		</Dropdown>
	</section>
	<Divider />
	{#if adapterName === 'in-memory'}
		<section>
			<h2>Epoch</h2>
			<p>Epoch duration: {$tokens.epochDuration / 1000} seconds</p>
			<p>Time to end epoch: {($tokens.timeToEpoch / 1000).toFixed()} seconds</p>
			<Button label="End epoch now" variant="secondary" on:click={startNewEpoch} />
		</section>
		<Divider />
		<section>
			<Textarea label="Available GO token value" bind:value={goTokenValue} />
			<Textarea label="Total REP token" bind:value={repTokenValue} />
			<Button label="Update" on:click={updateTokens} />
		</section>
		<Divider />
	{/if}
</Container>

<style lang="scss">
	section {
		margin-top: 1rem;
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
