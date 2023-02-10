<script lang="ts">
	import Undo from '$lib/components/icons/undo.svelte'
	import Close from '$lib/components/icons/close.svelte'
	import ArrowRight from '$lib/components/icons/arrow-right.svelte'
	import Button from '$lib/components/button.svelte'
	import { personas } from '$lib/stores/persona'
	

	let name = ''
	let pitch = ''
	let description = ''
	let y: number
	let descriptionHeight: number
</script>

<svelte:window bind:scrollY={y} />

<header class={y > 0 ? 'scrolled' : ''}>
	<div class="btn-undo">
		<Button icon={Undo} on:click={() => history.back()} />
	</div>
	<h1>Create persona</h1>
</header>

<form>
	<label>
		Persona name
		<input type="text" bind:value={name} placeholder="Enter a short memorable name…" />
	</label>
	
	<label>
		Persona pitch
		<div class="area-placeholder">
			<div class="{`placeholder-text ${pitch != '' ? 'hide' : ''} `}">
				Pitch the persona in one sentence, this should serve as a brief introduction…
			</div>
			<textarea bind:value={pitch} class={pitch != '' ? 'content' : ''} />
		</div>
	</label>
	
	<label>
		Persona description
		<div class="area-placeholder">
			<div bind:clientHeight={descriptionHeight} class={`placeholder-text ${description != '' ? 'hide' : ''} `}>
				Describe the persona in more details, provide additional context and help anyone understand the concept of this persona…
			</div>
			<textarea 
				bind:value={description} 
				class={description != '' ? 'content' : ''}  
				style={`${description != '' ? 'min-height: ' + descriptionHeight : ''}px;`}  
			/>
		</div>
	</label>
	
	<div class="btns">
		<Button label="Cancel" icon={Close} on:click={() => history.back()} />
		<Button
			label="Proceed"
			icon={ArrowRight}
			variant='primary'
			disabled
			on:click={() => {
				$personas.draft
			}}
		/>
	</div>
</form>

<style lang="scss">
	header {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		background-color: rgba(var(--color-body-bg-rgb), 0.93);
		backdrop-filter: blur(3px);
		transition: box-shadow 0.2s;
		z-index: 100;
		// position: relative;
		padding: var(--spacing-24);
		display: flex;
		align-items: center;
    	justify-content: center;

		&.scrolled {
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-text-rgb), 0.25);
			transition: box-shadow 0.2s;

				@media (min-width: 688px) {
					padding-block: var(--spacing-24);
					transition: padding 0.2s;
				}
		}

		@media (prefers-color-scheme: dark) {
			box-shadow: 0 1px 5px 0 rgba(var(--color-body-bg-rgb), 0.75);
		}

		@media (min-width: 688px){
			padding: var(--spacing-48);
		}
		
		.btn-undo {
			position: absolute;
			inset: var(--spacing-24) auto 0 var(--spacing-24);
			@media (min-width: 688px){
				inset: var(--spacing-48) auto 0 var(--spacing-48);
			}
		}
		
		h1 {
			font-family: var(--font-body);
			font-weight: 600;
			font-size: 18px;
			font-style: normal;
			text-align: center;
			line-height: 44px;
		}
	}
	
	form {
		min-height: calc(100dvh - 92px);
		min-height: calc(100vh - 92px);
		display: flex;
		align-items: stretch;
		justify-content: center;
		flex-direction: column;
		gap: var(--spacing-48);
		max-width: 498px;
		margin-inline: auto;
		padding: var(--spacing-24);

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
					}
					&.content {
						position: static;
						width: 100%;
					}
				}
			}
		}

		input  {
			width: 100%;
			height: 100%;
			border: none;
			font-size: var(--font-size-lg);

			::placeholder {
				color: var(--grey-300);
			}
		}

		.btns {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-12);
			padding-top: var(--spacing-48);
		}
	}
</style>