<script lang="ts">
	import Button from '$lib/components/button.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import SendAltFilled from '$lib/components/icons/send-alt-filled.svelte'
	import InputString from '$lib/components/input-string.svelte'
	import { profile } from '$lib/stores/profile'
	import { posts } from '$lib/stores/post'
	import { goto } from '$app/navigation'
	import { ROUTES } from '$lib/routes'

	let cls: string | undefined = undefined
	export { cls as class }

	let postText = ''

	async function submit() {
		if (!$profile.signer) return

		const address = await $profile.signer.getAddress()

		posts.add({
			timestamp: Date.now(),
			text: postText,
			user: { address },
		})
		goto(ROUTES.HOME)
	}
</script>

<div class={`root ${cls}`}>
	<div class="header">
		<div>Create post</div>
		<div class="btns">
			<!-- THIS IS A HACK JOB BECAUSE I'M NOT SURE HOW TO CHANGE A PROP VALUE (label) BASED ON MEDIA QUERY -->
			<!-- to test: use js to bind the window width to a variable x, just like we're doing y, test value of x -->
			<div class="sm">
				<Button variant="secondary" icon={Close} on:click={() => history.back()} />
			</div>			
			<div class="lg">
				<Button variant="secondary" icon={Close} label="Cancel" on:click={() => history.back()} />
			</div>
			<Button
				variant="primary"
				label="Publish"
				icon={SendAltFilled}
				on:click={submit}
				disabled={!$profile.signer}
			/>
		</div>
	</div>
	<div class="post-content">
		<InputString bind:value={postText} placeholder="Write here..." />
	</div>
</div>

<style lang="scss">
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
		padding: var(--spacing-12) var(--spacing-12) var(--spacing-24);
	}

	.btns {
		display: flex;
		flex-direction: row;
		gap: var(--spacing-12);
		align-items: center;

		.sm {
			display: block;
		}
		.lg {
			display: none;
		}

		@media (min-width: 1280px) {
			.sm {
				display: none;
			}
			.lg {
				display: block;
			}
		}
	}

	.post-content {
		padding: var(--spacing-24) var(--spacing-12) var(--spacing-12);
		height: calc(100vh - 80px);
	}
</style>
