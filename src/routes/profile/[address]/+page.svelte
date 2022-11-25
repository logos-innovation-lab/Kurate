<script lang="ts">
	import Avatar from '$lib/components/avatar.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="root">
	<div><Avatar src={data.avatar} /></div>
	<div>{data.name}</div>
	<div>{data.address}</div>
</div>

<style>
	.root {
		display: flex;
		flex-direction: column;
	}
</style>
