<script lang="ts">
	import { FoodLocation, type SuggestionMetadata } from "../schemas/suggestion";
	import VoteCounter from "./VoteCounter.svelte";
	interface Props {
		title: string;
		votes: number;
		vote?: "up" | "down" | undefined;
		id: number;
		metadata?: SuggestionMetadata | null;
		userId?: string;
	}
	let {
		title,
		votes,
		id,
		vote = $bindable(),
		metadata,
		userId,
	}: Props = $props();
	// @ts-expect-error
	const invertedFoodLocations: Record<FoodLocation, keyof typeof FoodLocation> =
		{};
	for (let location in FoodLocation) {
		invertedFoodLocations[FoodLocation[location as keyof typeof FoodLocation]] =
			location as keyof typeof FoodLocation;
	}
</script>

<div
	class="flex rounded-2xl bg-base-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-base-300 overflow-hidden h-40 gap-3"
>
	<VoteCounter suggestionId={id} {votes} {userId} {vote} stacked />
	<a
		href={`/suggestion/${id}`}
		class="py-4 pr-4 flex place-content-center flex-col grow"
	>
		<span class="col-span-4 text-xl align-middle font-bold underline">
			{title}
		</span>
		{#if metadata?.locations}
			<div class="flex place-items-center gap-3 h-12">
				{#each metadata.locations as loc}
					<img src={`/images/${invertedFoodLocations[loc]}.avif`} class="h-6" />
				{/each}
			</div>
		{/if}
	</a>
</div>
