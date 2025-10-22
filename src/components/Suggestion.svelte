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
	const voteValues = {
		up: 1,
		down: -1,
		default: 0,
	};
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
								vote: newVote,
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
		votes += voteValues[vote || "default"] - voteValues[oldVote || "default"];
	}
</script>

<div
	class="flex rounded-2xl bg-base-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-base-300 overflow-hidden h-40 gap-3"
>
	<div class="flex flex-col items-center justify-center gap-1 py-4 pl-4">
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
	</div>
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
