<script lang="ts">
	import PersonaEditText from '$lib/components/persona_edit_text.svelte'

	let persona = {
		name: '',
		pitch: '',
		description: '',
	}

	const state: 'edit_text' | 'edit_images' | 'confirm' = 'edit_text'

	function onSubmitText() {
		console.log(persona)
	}
</script>

{#if state==='edit_text'}
	<PersonaEditText
		bind:name={persona.name}
		bind:pitch={persona.pitch}
		bind:description={persona.description}
		title="Create persona"
		onSubmit={onSubmitText}
		onCancel={history.back}
	/>
{/if}

<style lang="scss">
</style>
