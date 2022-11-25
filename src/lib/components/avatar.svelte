<script lang="ts">
	import defaultAvatar from '$lib/assets/default-avatar.png'

	export let src: string = defaultAvatar
</script>

<img class="root" {src} alt="Avatar" />

<style>
	.root {
		width: 44px;
		height: 44px;
		border-radius: 22px;
		background-color: var(--color-light-grey-background);
		object-fit: cover;
		overflow: hidden;
	}
</style>
