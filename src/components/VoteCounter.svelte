<script lang="ts">
	import Button from "../components/Button.svelte";
	interface Props {
		userId?: string;
		suggestionId: number;
		vote?: "up" | "down";
		votes: number;
		class?: string;
		stacked?: boolean;
	}
	let {
		userId,
		suggestionId,
		vote,
		votes,
		class: className,
		stacked,
	}: Props = $props();
	const voteValues = {
		up: 1,
		down: -1,
		default: 0,
	};
	async function changeVote(newVote: "up" | "down") {
		if (!userId)
			window.location.href = `/api/auth/signin?redirectURL=${encodeURIComponent(window.location.pathname + window.location.search + window.location.hash)}`;
		const res = await fetch(
			vote === newVote ? "/api/suggestion/unvote" : "/api/suggestion/vote",
			{
				body:
					vote === newVote
						? suggestionId.toString()
						: JSON.stringify({
								id: suggestionId.toString(),
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
	class={stacked
		? "flex flex-col items-center justify-center gap-1 py-4 pl-4"
		: "grid grid-rows-2 gap-1"}
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
	{#if stacked}
		<span>{votes || 0}</span>
	{/if}
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
{#if !stacked}
	<div class="text-3xl font-bold">
		{votes || 0}
	</div>
{/if}
