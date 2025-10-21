<script lang="ts">
	import { FoodLocation, type SuggestionMetadata } from "../schemas/suggestion";
	import Button from "./Button.svelte";
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
	async function changeVote(newVote: "up" | "down") {
		if (!userId)
			window.location.href = `/api/auth/signin?redirectURL=${encodeURIComponent("/food")}`;
		const res = await fetch(
			vote === newVote ? "/api/suggestion/unvote" : "/api/suggestion/vote",
			{
				body:
					vote === newVote
						? id.toString()
						: JSON.stringify({
								id: id.toString(),
								vote: "down",
							}),
				method: "POST",
			},
		);
		let oldVote = vote;
		if (!res.ok) {
			vote = oldVote;
			return;
		}
		if (vote === newVote) {
			vote = undefined;
		} else {
			vote = newVote;
		}
	}
</script>

<div
	class="dark:bg-base-200 shadow-md rounded-lg flex flex-row gap-3 p-3 items-center light:b-1 overflow-hidden"
>
	<Button
		type={vote === "up" ? "primary" : "tertiary"}
		icon="i-bx:upvote"
		onclick={(e) => {
			e.preventDefault();
			changeVote("up");
		}}
		ariaLabel="upvote"
	></Button>
	<span>{votes}</span>
	<Button
		type={vote === "down" ? "primary" : "tertiary"}
		icon="i-bx:downvote"
		onclick={(e) => {
			e.preventDefault();
			changeVote("down");
		}}
		ariaLabel="downvote"
	></Button>
	{#if metadata?.locations}
		{#each metadata.locations as loc}
			<img src={`/images/${invertedFoodLocations[loc]}.avif`} class="w-6" />
		{/each}
	{/if}
	<a
		class="col-span-4 text-xl align-middle font-bold underline grow"
		href={`/suggestion/${id}`}
	>
		{title}
	</a>
</div>
