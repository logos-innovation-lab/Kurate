<script>
	export let progress = 0
	let radius = 24
	let strokeWidth = 12
	let circleLength = 2 * Math.PI * radius
	let strokeDashoffset = circleLength * (1 - progress)
	$: strokeDashoffset = circleLength * (1 - progress)
</script>

<div class="container">
	<svg width="60" height="60" style="transform: rotate(-90deg);">
		<circle
			class="circle-bg"
			cx="30"
			cy="30"
			r={radius}
			stroke-width={strokeWidth}
			fill="transparent"
		/>
		<circle
			class="circle-progress"
			cx="30"
			cy="30"
			r={radius}
			stroke-width={strokeWidth}
			fill="transparent"
			style="stroke-dasharray: {circleLength}; stroke-dashoffset: {strokeDashoffset};"
		/>
	</svg>
</div>

<style>
	.container {
		width: 220px;
		height: 220px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.circle-bg {
		stroke: #ececec;
	}

	.circle-progress {
		stroke: #181818;
		/* stroke-linecap: round; */
	}
</style>
