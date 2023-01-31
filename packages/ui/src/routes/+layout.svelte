<script lang="ts">
	import '@fontsource/source-code-pro'
	import '@fontsource/source-sans-pro'
	import '@fontsource/source-serif-pro'
	import './styles.css'

	import Modal from '$lib/components/modal.svelte'

	import { errors } from '$lib/stores/errors'
	import { onDestroy, onMount } from 'svelte'
	import { getEthereum, switchNetwork } from '$lib/services/blockchain'
	import type { providers } from 'ethers'
	import { TARGET_CHAIN_ID } from '$lib/constants'
	import type { ErrorWithCode } from '$lib/types'

	onMount(() => {
		const ethereum = getEthereum() as providers.Provider
		ethereum.on('chainChanged', (chainId: string) => {
			if (chainId !== TARGET_CHAIN_ID) {
				$errors = [
					new Error('You are connected to a wrong ethereum network. Please switch to Goerli'),
				]
				switchNetwork(TARGET_CHAIN_ID).catch(
					() =>
						($errors = [
							new Error('Network change rejected, please change the network manually.'),
							...$errors,
						]),
				)
			} else {
				window.location.reload()
			}
		})

		ethereum.on('disconnect', (error: ErrorWithCode) => {
			errors.add(
				new Error(
					'Disconnected from the ethereum network. Please check your internet connection and refresh the page',
				),
			)
			console.error(error)
		})
	})

	onDestroy(() => {
		console.log('hello')
	})
</script>

{#if $errors.length > 0}
	<Modal
		message={$errors[0].message}
		action={() => {
			const [err, ...rest] = $errors
			$errors = rest
			console.error(`Resolved error ${err.message}`)
		}}
	/>
{/if}

<slot />
