<script lang="ts">
	import Undo from '$lib/components/icons/undo.svelte'
	import Button from '$lib/components/button.svelte'
	import { personas } from '$lib/stores/persona'

	let name = ''
	let pitch = ''
	let description = ''
</script>

<Button icon={Undo} on:click={() => history.back()} />
<span>Create persona</span>

<label>
	Persona name
	<input type="text" bind:value={name} placeholder="Enter a short memorable name…" />
</label>

<label>
	Persona pitch
	<textarea bind:value={pitch} />
</label>

<label>
	Persona description
	<textarea bind:value={description} />
</label>

<Button label="Cancel" on:click={() => history.back()} />
<Button
	label="Proceed"
	on:click={() => {
		$personas.draft
	}}
/>
