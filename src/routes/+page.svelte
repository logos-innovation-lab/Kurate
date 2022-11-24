<script lang="ts">
	import Header from '$lib/components/header.svelte'
	import Button from '$lib/components/button.svelte'
	import WalletIcon from '$lib/components/icons/wallet.svelte'
</script>

<div>
	<Header />
	<Button label="Light Button" />
	<Button variant="dark" label="Dark Button" icon={WalletIcon} />
</div>
