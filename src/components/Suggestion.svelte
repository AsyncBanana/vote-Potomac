<script lang="ts">
	import { FoodLocation, type SuggestionMetadata } from "../schemas/suggestion";
	import Button from "./Button.svelte";
	interface Props {
		title: string;
		votes: number;
		vote?: "up" | "down";
		id: number;
		metadata?: SuggestionMetadata | null;
	}
	const { title, votes, id, vote, metadata }: Props = $props();
	// @ts-expect-error
	const invertedFoodLocations: Record<FoodLocation, keyof typeof FoodLocation> =
		{};
	for (let location in FoodLocation) {
		invertedFoodLocations[FoodLocation[location as keyof typeof FoodLocation]] =
			location as keyof typeof FoodLocation;
	}
</script>

<a
	class="dark:bg-base-200 shadow-md rounded-lg flex flex-row gap-3 p-3 items-center light:b-1 overflow-hidden"
	href={`/suggestion/${id}`}
>
	<Button
		type={vote ? "primary" : "tertiary"}
		nonInteractive
		icon={vote === "down" ? "i-bx:downvote" : "i-bx:upvote"}
	>
		{votes}
	</Button>
	{#if metadata?.locations}
		{#each metadata.locations as loc}
			<img src={`/images/${invertedFoodLocations[loc]}.avif`} class="w-6" />
		{/each}
	{/if}
	<h2 class="col-span-4 text-xl align-middle font-bold">
		{title}
	</h2>
</a>
