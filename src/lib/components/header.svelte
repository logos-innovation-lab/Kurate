<script lang="ts">
	import UserIcon from '$lib/components/icons/user.svelte';
</script>

<div class="root">
	<span class="title">The Outlet</span>
	<div class="user-icon">
		<UserIcon size={18} />
	</div>
</div>

<style>
	.root {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
	}
	.title {
		font-family: 'SourceSansPro-Semibold';
		font-size: 18px;
		font-weight: 600;
		font-style: normal;
		text-align: left;
	}
	.user-icon {
		width: 38px;
		height: 38px;
		border-radius: 19px;
		border-color: #dddddd;
		border-style: solid;
		border-width: 1px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
