<script lang="ts">
	import clsx from "clsx";
	import Button from "../components/Button.svelte";
	interface Notification {
		type: "error" | "info";
		message: string;
	}
	let notification = $state<Notification | undefined>();
</script>

<div class="modal modal-bottom t" id="submit" role="dialog">
	<div class="modal-box">
		<div class="flex place-content-between place-items-center">
			<h1 class="font-semibold text-3xl">Suggest New Food Item</h1>
			<Button icon="i-ic:round-close" type="tertiary" href="#" />
		</div>
		<form
			class="form-control flex"
			id="suggestionSubmit"
			action="/api/suggestion?type=food"
			method="post"
			onsubmit={async (e) => {
				if (!(e.target as HTMLFormElement).reportValidity()) {
					return;
				}
				e.preventDefault();
				const res = await fetch("/api/suggestion?type=food&live", {
					method: "POST",
					body: new FormData(e.target as HTMLFormElement),
				});
				if (res.ok) {
					(e.target as HTMLFormElement).reset();
					notification = { type: "info", message: "Suggestion Posted!" };
				} else {
					notification = {
						type: "error",
						message:
							"Error submitting suggestion. Please let Jacob (jacjackson@potomacschool.org) know.",
					};
				}
			}}
		>
			<label class="label" for="title">What do you want?</label>
			<input
				type="text"
				class="input input-bordered"
				id="title"
				name="title"
				required
				minlength={import.meta.env.PUBLIC_MIN_TITLE_LENGTH}
				maxlength={import.meta.env.PUBLIC_MAX_TITLE_LENGTH}
			/>
			<fieldset class="flex flex-col gap-2" name="locations">
				<label class="label" for="locations">Where do you want it?</label>
				<input
					type="checkbox"
					class="btn ci-vending checked:btn-secondary"
					name="vending"
					aria-label="Vending Machine"
				/>
				<input
					type="checkbox"
					class="btn ci-breakfast"
					aria-label="Breakfast Bar"
					name="breakfast"
				/>
				<input
					type="checkbox"
					class="btn ci-pantherpit"
					name="pantherpit"
					aria-label="Panther Pit"
				/>
			</fieldset>
			<Button class="mt-3">Suggest Food</Button>
			{#if notification}
				<div
					class={clsx(
						"alert mt-3 w-full flex place-content-between",
						notification.type === "error" && "alert-error",
					)}
					id="notification"
				>
					<span>{notification.message}</span>
					<Button
						type="tertiary"
						icon="i-ic:round-close"
						action="button"
						onclick={() => (notification = undefined)}
					/>
				</div>
			{/if}
		</form>
	</div>
</div>

<style global>
	@media (min-width: 768px) {
		.t {
			place-items: center;
		}
		.t :where(.modal-box) {
			width: 91.666667%;
			max-width: 32rem; /* 512px */
			--un-translate-y: 0px;
			--un-scale-x: 0.9;
			--un-scale-y: 0.9;
			transform: translate(var(--un-translate-x), var(--un-translate-y))
				rotate(var(--un-rotate)) skewX(var(--un-skew-x)) skewY(var(--un-skew-y))
				scaleX(var(--un-scale-x)) scaleY(var(--un-scale-y));
			border-top-left-radius: var(--rounded-box, 1rem);
			border-top-right-radius: var(--rounded-box, 1rem);
			border-bottom-left-radius: var(--rounded-box, 1rem);
			border-bottom-right-radius: var(--rounded-box, 1rem);
		}
	}
</style>
