<script lang="ts">
	import './styles.css';
	import Header from '$lib/components/header.svelte';
	import Button from '$lib/components/button.svelte';
</script>

<div>
	<Header />
	<Button>Light Button</Button>
	<Button variant="dark">Dark Button</Button>
</div>
