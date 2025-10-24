<script lang="ts">
	import Suggestion from "./Suggestion.svelte";
	import Button from "./Button.svelte";
	import type { SuggestionPreview } from "../types/Data";
	import type { QuestionQueryConfig } from "../modules/getSuggestions";
	import { queryConfig as partialQueryConfig } from "../state/QueryConfig.svelte";
	interface Props {
		suggestions: SuggestionPreview[];
		queryConfig?: Exclude<QuestionQueryConfig, "offset">;
		userId?: string;
		loadAdditional?: boolean;
		isFood?: boolean;
	}
	let {
		userId,
		suggestions = $bindable(),
		loadAdditional = $bindable(),
		isFood,
	}: Props = $props();
	let notice = $state("");
	let offset = $state(0);
	async function loadSuggestions(keep: boolean = true) {
		const res = await fetch(
			`/api/suggestions?offset=${offset}&sort=${queryConfig?.sort || "top"}${queryConfig?.foodLocation ? `&location=${queryConfig.foodLocation}` : ""}${queryConfig.isFood ? "&food" : ""}${queryConfig?.query ? `&q=${queryConfig.query}` : ""}`,
		);
		if (res.status === 404) {
			notice = "No suggestions found :(";
			loadAdditional = false;
			if (!keep) suggestions = [];
			return;
		}
		if (!res.ok) {
			notice = "Error loading suggestions :(";
			loadAdditional = false;
			return;
		}
		notice = "";
		loadAdditional = true;
		const newSuggestions = (await res.json()) as SuggestionPreview[];
		loadAdditional = newSuggestions.length > 29;
		if (keep) {
			suggestions = [...suggestions, ...newSuggestions];
		} else {
			suggestions = newSuggestions;
		}
	}
	let initialRun = true;
	$effect(() => {
		partialQueryConfig().sort;
		partialQueryConfig().query;
		partialQueryConfig().foodLocation;
		if (initialRun) {
			initialRun = false;
			return;
		}
		loadSuggestions(false);
	});

	const queryConfig = $derived({
		...partialQueryConfig(),
		isFood: isFood,
	});
	if (typeof addEventListener !== "undefined") {
		addEventListener("suggestionPosted", (e: CustomEvent) => {
			suggestions.unshift(e.detail);
			suggestions = suggestions;
		});
	}
</script>

{#each suggestions as suggestion}
	<Suggestion
		title={suggestion.title}
		votes={suggestion?.voteCount || 0}
		id={suggestion.id}
		vote={userId
			? suggestion.votes?.includes(userId)
				? "up"
				: suggestion.downvotes?.includes(userId)
					? "down"
					: undefined
			: undefined}
		metadata={suggestion.metadata}
		{userId}
	/>
{/each}
{#if loadAdditional}
	<Button
		onclick={async () => {
			offset += 30;
			await loadSuggestions();
		}}
		type="tertiary">Load More Suggestions</Button
	>
{/if}
{#if notice}
	<p>{notice}</p>
{/if}
