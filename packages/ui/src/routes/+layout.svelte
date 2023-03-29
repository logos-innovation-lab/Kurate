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
<a class="dev" href="/dev">DEV DASHBOARD</a>

<style>
	.dev {
		position: fixed;
		right: 0;
		bottom: 0;
		padding: 5px;
		background: #000;
		color: #fff;
		font-size: 0.9rem;
	}
</style>
