<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Checkmark from '$lib/components/icons/checkmark.svelte'
	import Image from '$lib/components/icons/image.svelte'
	import Header from '$lib/components/header.svelte'
	import Textarea from '$lib/components/textarea.svelte'
	import { profile } from '$lib/stores/profile'
	import InputFile from '$lib/components/input-file.svelte'
	import { resize } from '$lib/utils/image'
	import { MAX_DIMENSIONS } from '$lib/constants'
	import Close from './icons/close.svelte'
	import adapter from '$lib/adapters'

	let cls: string | undefined = undefined
	export { cls as class }
	export let submit: (postText: string, images: string[]) => unknown
	export let onBack: (postText: string, images: string[]) => unknown = () => history.back()
	export let label: string | undefined = 'Submit'
	export let postText = ''
	export let images: string[] = []

	let x: number

	let files: FileList

	const removeImage = (index: number) => () => {
		const newImages = [...images]
		newImages.splice(index, 1)
		images = newImages
	}

	async function resizeAndAddImages(files: FileList) {
		try {
			const imgs = []
			for (let i = 0; i < files.length; i++) {
				imgs.push(
					await adapter.uploadPicture(
						await resize(
							files[i],
							MAX_DIMENSIONS.POST_PICTURE.width,
							MAX_DIMENSIONS.POST_PICTURE.height,
						),
					),
				)
			}
			images = [...images, ...imgs]
		} catch (error) {
			console.error(error)
		}
	}
	$: files && resizeAndAddImages(files)
</script>

<svelte:window bind:innerWidth={x} />

<div class={`root ${cls}`}>
	<Header onBack={() => onBack(postText, images)}>
		<InputFile icon={Image} bind:files multiple />
		<Button
			icon={Checkmark}
			variant="primary"
			{label}
			on:click={() => submit(postText, images)}
			disabled={!$profile.signer && postText === ''}
		/>
	</Header>

	<div class="parent parent--adjusted-width">
		{#each images as image, index}
			<div class="child">
				<img src={adapter.getPicture(image)} alt="post" />
				<div class="icon">
					<Button icon={Close} variant="overlay" small on:click={removeImage(index)} />
				</div>
			</div>
		{/each}
	</div>
	<div class="post-content">
		<Textarea noHighlight bind:value={postText} placeholder="Write here..." autofocus />
	</div>
</div>

<style lang="scss">
	.post-content {
		max-width: 450px;
		margin-inline: auto;
	}

	/* The magic */
	/* Mixins for defining a grid with min and max columns */
	// Thanks to https://stackoverflow.com/questions/28028297/how-can-i-delete-a-window-history-state

	/* Adjusted columns width */
	@mixin grid-cols-adjusted($min-cols, $max-cols, $cols-min-width, $row-gap: 0px, $col-gap: 0px) {
		--min-cols: #{$min-cols};
		--max-cols: #{$max-cols};
		--cols-min-width: #{$cols-min-width};
		--row-gap: #{$row-gap};
		--col-gap: #{$col-gap};

		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(
				min(
					(100% / var(--min-cols) - var(--col-gap) * (var(--min-cols) - 1) / var(--min-cols)),
					max(
						var(--cols-min-width),
						(100% / var(--max-cols) - var(--col-gap) * (var(--max-cols) - 1) / var(--max-cols))
					)
				),
				1fr
			)
		);
		gap: var(--row-gap) var(--col-gap);
	}

	/* Fixed columns width */
	@mixin grid-cols-fixed($min-cols, $max-cols, $cols-min-width, $row-gap: 0px, $col-gap: 0px) {
		--min-cols: #{$min-cols};
		--max-cols: #{$max-cols};
		--cols-min-width: #{$cols-min-width};
		--row-gap: #{$row-gap};
		--col-gap: #{$col-gap};

		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(
				0,
				min(
					(100% / var(--min-cols) - var(--col-gap) * (var(--min-cols) - 1) / var(--min-cols)),
					max(
						var(--cols-min-width),
						(100% / var(--max-cols) - var(--col-gap) * (var(--max-cols) - 1) / var(--max-cols))
					)
				)
			)
		);
		gap: var(--row-gap) var(--col-gap);
	}

	.parent {
		/* Set styles to see the parent */
		margin-inline: auto;
		max-width: 450px;

		/* Grid systems */
		$min-cols: 1;
		$max-cols: 3;
		$cols-min-width: 2rem;
		$row-gap: var(--spacing-6);
		$col-gap: var(--spacing-6);
		&--adjusted-width {
			@include grid-cols-adjusted($min-cols, $max-cols, $cols-min-width, $row-gap, $col-gap);
		}
		&--fixed-width {
			@include grid-cols-fixed($min-cols, $max-cols, $cols-min-width, $row-gap, $col-gap);
		}
	}

	.child {
		flex-basis: 100%;
		position: relative;

		img {
			max-height: 300px;
			max-height: 300px;
		}

		&:not(:only-child) img {
			aspect-ratio: 1;
			object-fit: cover;
			width: 100%;
			height: 100%;
		}

		.icon {
			position: absolute;
			right: var(--spacing-12);
			top: var(--spacing-12);
		}
	}
</style>
