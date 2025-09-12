<script lang="ts">
	import Button from "./Button.svelte";
	let run = false;
</script>

{#if !run}
	<Button
		type="secondary"
		id="suggestionLoader"
		onclick={() => {
			window.loadSuggestions();
			run = true;
		}}>Load More Suggestions</Button
	>
{/if}
