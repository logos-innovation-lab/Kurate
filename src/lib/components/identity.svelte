<script lang="ts">
	import type { User } from '$lib/stores/user'
	import Avatar from './avatar.svelte'
	import ArrowRight from './icons/arrow-right.svelte'

	export let identity: User
</script>

<div class="root">
	<Avatar src={identity.avatar} />
	<div class="description">
		<div>{identity.name}</div>
		<div />
	</div>
	<ArrowRight />
</div>

<style lang="scss">
	.root {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.description {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}
</style>
