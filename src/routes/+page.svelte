<script lang="ts">
	import './styles.css'
	import Header from '$lib/components/header.svelte'
	import Button from '$lib/components/button.svelte'
	import WalletIcon from '$lib/components/icons/wallet.svelte'
</script>

<div>
	<Header />
	<Button>Light Button</Button>
	<Button variant="dark" icon={WalletIcon}>Dark Button</Button>
</div>
