<script lang="ts">
	import UserIcon from '$lib/components/icons/user.svelte'
	import Button from './button.svelte'

	let cls: string | undefined = undefined
	export { cls as class }
</script>

<div class={`root ${cls}`}>
	<div class="header">
		<span class="title">The Outlet</span>
		<Button icon={UserIcon} />
	</div>
	<div class="subheader">
		Milestone 1 shaman pitchfork typewriter single-origin coffee beard flannel, actually chillwave.
	</div>
</div>

<style>
	.root {
		top: 0;
		left: 0;
		right: 0;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-12);
	}
	.title {
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 18px;
		font-style: normal;
		text-align: left;
	}

	.subheader {
		padding: var(--spacing-12);
		padding-bottom: var(--spacing-24);
	}
</style>
