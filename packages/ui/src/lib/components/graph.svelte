<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }

	interface GraphRecord {
		timestamp: number
		value: number
	}

	export let minX: number
	export let maxX: number
	export let minY = 0
	export let maxY: number
	export let values: GraphRecord[]
</script>

<div class={`root ${cls}`}>
	x axis scale: {minX} - {maxX}
	y axis scale: {minY} - {maxY}
	values length: {values.length}
</div>

<style lang="scss">
</style>
