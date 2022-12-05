<script lang="ts">
	export let files: FileList | undefined = undefined
</script>

<div>
	<span>Profile picture</span>
	<label>
		Add image
		<input type="file" bind:files />
	</label>
</div>
