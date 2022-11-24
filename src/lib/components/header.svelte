<script lang="ts">
	import UserIcon from '$lib/components/icons/user.svelte'
	import Button from './button.svelte'
</script>

<div class="root">
	<span class="title">The Outlet</span>
	<Button icon={UserIcon} />
</div>

<style>
	.root {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
	}
	.title {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 18px;
		font-style: normal;
		text-align: left;
	}
</style>
