<script lang="ts">
	import { goto } from '$app/navigation'
	import Button from '$lib/components/button.svelte'
	import { profile } from '$lib/stores/profile'
</script>

<h1>Choose identity</h1>
<Button click={() => goto('/')} />
{#each $profile.profiles as p}
	<div>{p.avatar}{p.name}-{p.address}</div>
{/each}
<Button label="Create new identity" />
<span>You can create multiple identities under the same account.</span>
<a href="/">Learn more about identities.</a>
