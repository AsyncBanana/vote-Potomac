<script lang="ts">
	import { queryConfig } from "../state/QueryConfig.svelte";
</script>

<div class="input input-bordered w-full flex align-middle items-center gap-3">
	<div class="i-material-symbols:search h-6 w-6"></div>
	<input
		type="search"
		placeholder="Search for suggestions..."
		class="bg-transparent h-full grow"
		id="suggestionSearch"
		onchange={(e) => (queryConfig().query = e.target.value)}
		value={queryConfig().query}
	/>
</div>
