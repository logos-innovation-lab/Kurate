<script lang="ts">
	import type { IconProps } from '$lib/types'

	type $$Props = IconProps

	let cls: string | undefined = undefined
	export { cls as class }
	export let size = 20
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} class={cls}>
	<path
		d="M23,11.67V4h3V2H6V4H9v7.67a2,2,0,0,0,.4,1.2L11.75,16,9.4,19.13a2,2,0,0,0-.4,1.2V28H6v2H26V28H23V20.33a2,2,0,0,0-.4-1.2L20.25,16l2.35-3.13A2,2,0,0,0,23,11.67ZM21,4v7H11V4Zm0,16.33V28H11V20.33L14.25,16,12,13h8l-2.25,3Z"
	/>
</svg>
