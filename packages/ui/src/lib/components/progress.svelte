<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }

	export let variant: 'circle' | 'line' = 'line'
	export let min = 0
	export let max: number
	export let current: number
</script>

<div class={`root ${cls}`}>
	This will be progress bar in shape of {variant} with min value of {min}, max value {max} and current
	value {current}
</div>

<style lang="scss">
</style>
