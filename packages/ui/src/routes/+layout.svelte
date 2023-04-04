<script lang="ts">
	import { onDestroy, onMount } from 'svelte'

	import '@fontsource/source-code-pro'
	import '@fontsource/source-sans-pro'
	import '@fontsource/source-serif-pro'
	import './styles.css'

	import adapter from '$lib/adapters'

	onMount(() => {
		if (typeof adapter.start === 'function') adapter.start()
	})

	onDestroy(() => {
		if (typeof adapter.stop === 'function') adapter.stop()
	})
</script>

<slot />
