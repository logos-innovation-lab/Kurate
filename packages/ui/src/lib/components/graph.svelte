<script lang="ts">
	let cls: string | undefined = undefined
	export { cls as class }

	interface GraphRecord {
		timestamp: number
		value: number
	}

    export let range: number
	export let values: GraphRecord[]

	let minTimestamp = values[0]?.timestamp
	let maxTimestamp = values[0]?.timestamp
	let minValue = values[0]?.value
	let maxValue = values[0]?.value

    for (let i = 1; i < values.length; i++) {
        let {timestamp, value} = values[i]

        if (timestamp < minTimestamp) minTimestamp = timestamp
        if (timestamp > maxTimestamp) maxTimestamp = timestamp
        if (value < minValue) minValue = value
        if (value > maxValue) maxValue = value
    }

    console.log(range, values)
</script>

<div class={`root ${cls}`}>
    <svg width='100%' height='140'>
    </svg>
</div>

<style lang="scss">
</style>
