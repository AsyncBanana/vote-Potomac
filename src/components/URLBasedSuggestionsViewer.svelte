<script lang="ts">
	import type { SuggestionPreview } from "../types/Data";
	import SuggestionsViewer from "./SuggestionsViewer.svelte";
	import { queryConfig } from "../state/QueryConfig.svelte";
	interface Props {
		userId?: string;
		initialSuggestions: SuggestionPreview[];
		loadAdditional: boolean;
		isFood: boolean;
	}
	const {
		userId,
		loadAdditional = $bindable(),
		initialSuggestions,
		isFood,
	}: Props = $props();
	let suggestions = $state(initialSuggestions) as SuggestionPreview[];
	$effect(() => {
		const queryParams = new URLSearchParams();
		if (queryConfig().query) queryParams.append("q", queryConfig().query);
		if (queryConfig().sort) queryParams.append("sort", queryConfig().sort);
		if (queryConfig().foodLocation)
			queryParams.append("location", queryConfig().foodLocation);
		const curPath = new URL(window.location.href);
		curPath.search = queryParams.size > 0 ? queryParams.toString() : "";
		history.pushState("", "", curPath);
	});
</script>

<SuggestionsViewer {userId} {suggestions} {loadAdditional} {isFood} />
