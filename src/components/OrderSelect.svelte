<script lang="ts">
	import { queryConfig } from "../state/QueryConfig.svelte";
	interface Props {
		sortOrder: "recent" | "top";
	}
	let { sortOrder }: Props = $props();
</script>

<select
	class="select select-bordered w-max"
	id="sort"
	onchange={(e) => {
		sortOrder = (e.target as HTMLSelectElement).value as "recent" | "top";
		queryConfig().sort = sortOrder;
	}}
>
	<option selected={sortOrder === "recent"} value="recent">Most recent</option>
	<option selected={sortOrder === "top"} value="top">Most votes</option>
</select>
