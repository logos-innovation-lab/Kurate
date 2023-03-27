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
	export let label: string | undefined = 'Publish'
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

	<div class="imgs">
		{#each images as image, index}
			<div class="img-wrapper">
				<img src={adapter.getPicture(image)} alt="post" />
				<div class="icon">
					<Button icon={Close} variant="overlay" on:click={removeImage(index)} />
				</div>
			</div>
		{/each}
	</div>
	<div class="post-content">
		<Textarea bind:value={postText} placeholder="Write here..." autofocus />
	</div>
</div>

<style lang="scss">
	.post-content {
		max-width: 450px;
		margin-inline: auto;
	}
	.imgs {
		margin-inline: auto;
		max-width: 450px;
		display: flex;
		flex-direction: row;
		gap: var(--spacing-6);
		justify-content: flex-start;
		align-items: center;

		.img-wrapper {
			flex-basis: 100%;
			position: relative;

			img {
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
	}
</style>
