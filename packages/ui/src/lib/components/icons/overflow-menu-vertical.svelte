<script lang="ts">
	import type { IconProps } from '$lib/types'

	type $$Props = IconProps

	let cls: string | undefined = undefined
	export { cls as class }
	export let size = 20
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} class={cls}>
	<circle cx="16" cy="8" r="2" />
	<circle cx="16" cy="16" r="2" />
	<circle cx="16" cy="24" r="2" />
</svg>

<!-- <svg focusable="false" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
	<circle cx="16" cy="8" r="2"></circle>
	<circle cx="16" cy="16" r="2"></circle>
	<circle cx="16" cy="24" r="2"></circle>
</svg> -->
