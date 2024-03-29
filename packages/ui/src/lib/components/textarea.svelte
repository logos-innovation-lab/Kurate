<script lang="ts">
	import { onDestroy, onMount } from 'svelte'

	export let value = ''
	export let placeholder = ''
	export let label = ''
	export let autofocus = false
	export let noHighlight: boolean | undefined = undefined

	let placeholderHeight: number
	let textarea: HTMLTextAreaElement

	const resizeEvents = ['change']
	const delayedResizeEvents = ['cut', 'paste', 'drop', 'keydown']

	function resize() {
		textarea.style.height = 'auto'
		textarea.style.height = `${Math.max(placeholderHeight, textarea.scrollHeight)}px`
	}

	function delayedResize() {
		setTimeout(resize, 0)
	}

	// The resize mechanism is heavily inspired by https://stackoverflow.com/a/5346855
	onMount(() => {
		resizeEvents.forEach((eventName) => textarea.addEventListener(eventName, resize))
		delayedResizeEvents.forEach((eventName) => textarea.addEventListener(eventName, delayedResize))
		resize()
	})

	// This cleans up all the listeners from the textarea element when the component is about to be destroyed
	onDestroy(() => {
		if (!textarea) return

		resizeEvents.forEach((eventName) => textarea.removeEventListener(eventName, resize))
		delayedResizeEvents.forEach((eventName) =>
			textarea.removeEventListener(eventName, delayedResize),
		)
	})
</script>

<label class={noHighlight ? '' : 'highlight'}>
	{label}
	<div class="area-placeholder">
		<div
			bind:clientHeight={placeholderHeight}
			class={`placeholder-text ${value != '' ? 'hide' : ''} `}
		>
			{placeholder}
		</div>
		<!-- svelte-ignore a11y-autofocus -->
		<textarea
			bind:value
			bind:this={textarea}
			on:keydown
			on:keypress
			on:keyup
			class={value != '' ? 'content' : ''}
			{autofocus}
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
		padding-block: var(--spacing-24);
		background-color: transparent;
		transition: background-color 0.2s;

		&.highlight {
			padding-inline: var(--spacing-24);
			&:focus-within {
				background-color: var(--grey-150);
				transition: background-color 0.2s;
			}
		}

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
				resize: none;
				background-color: transparent;
				transition: background-color 0.2s;
				font-size: var(--font-size-lg);
				font-family: var(--font-serif);

				&:focus,
				&.content {
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
