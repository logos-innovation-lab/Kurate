<script lang="ts">
	import type { User } from '$lib/stores/user'
	import Avatar from './avatar.svelte'
	import ArrowRight from './icons/arrow-right.svelte'

	export let identity: User
	export let click: undefined | ((id: User) => void) = undefined
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="root" on:click|preventDefault|stopPropagation={() => click && click(identity)}>
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
