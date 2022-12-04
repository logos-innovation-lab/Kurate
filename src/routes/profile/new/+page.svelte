<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'

	let username = ''
</script>

<div class="header">
	<h1>Create identity</h1>
	<Button icon={Close} on:click={() => history.back()} />
</div>
<div class="content">
	<div>
		<span>Public address</span>
		<div>0x00000...000</div>
	</div>
	<div>
		<span>Name</span>
		<input type="text" bind:value={username} />
	</div>
	<div>
		<span>Profile picture</span>
		<label>
			<input type="file" bind:value={username} />
		</label>
	</div>
	<Button variant="primary" disabled label="Confirm and create" />
</div>

<style lang="scss">
	.header {
		left: 0;
		right: 0;
		top: 0;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
