<script lang="ts">
	export let value = ''
	export let placeholder = ''
	export let label = ''
	let placeholderHeight: number
</script>

<label>
	{label}
	<div class="area-placeholder">
		<div
			bind:clientHeight={placeholderHeight}
			class={`placeholder-text ${value != '' ? 'hide' : ''} `}
		>
			{placeholder}
		</div>
		<textarea
			bind:value
			class={value != '' ? 'content' : ''}
			style={`${value != '' ? 'min-height: ' + placeholderHeight : ''}px;`}
		/>
	</div>
</label>

<style lang="scss">
	label {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-6);
		font-size: var(--font-size-sm);
		color: var(--color-body-text);

		.area-placeholder {
			position: relative;
			width: 100%;
			height: fit-content;
			.placeholder-text {
				font-size: var(--font-size-lg);
				color: var(--grey-300);
				width: 100%;
				height: fit-content;
				&.hide {
					display: none;
				}
			}
			textarea {
				position: absolute;
				inset: 0;
				border: none;
				background-color: transparent;
				transition: background-color 0.2s;
				font-size: var(--font-size-lg);

				&:focus,
				&.content {
					background-color: #ffffff;
					transition: background-color 0.2s;
					outline: none;
				}

				&.content {
					position: static;
					width: 100%;
				}
			}
		}
	}
</style>
