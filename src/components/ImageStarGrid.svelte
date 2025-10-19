<script lang="ts">
	import clsx from "clsx";

	interface Props {
		items: [string, string, number][];
	}
	let { items }: Props = $props();
	let selected = $state<number>();
	const colors = [
		"linear-gradient(270deg,rgba(255, 106, 0, 1) 0%,rgba(255, 152, 79, 1) 100%)",
		"linear-gradient(0deg,hsl(208 100% 50%), hsl(208 50% 50%)",
		"linear-gradient(0deg,hsl(300 100% 50%), hsl(300 50% 50%)",
	];
	$effect(() => {
		window.foodLocation = selected;
		window.querySearch();
	});
</script>

{#each items as item, idx}
	<div
		class={clsx(
			"transition-200",
			selected && selected !== item[2] && "opacity-60 scale-95",
		)}
	>
		<button
			class={clsx(
				"relative flex place-items-center place-content-center aspect-square group bg-transparent rounded-full transition-200 h-24 xs:h-28 xl:h-48",
				selected === item[2] && "after:rotate-30",
				selected &&
					selected !== item[2] &&
					"after:!bg-[linear-gradient(gray,gray)]",
			)}
			style={`background: ${colors[idx]}`}
			aria-label={item[0]}
			onclick={() => {
				if (selected === item[2]) {
					selected = 0;
				} else {
					selected = item[2];
				}
			}}
		>
			<!-- svelte-ignore a11y_missing_attribute -->
			<img
				src={item[1]}
				class={clsx(
					"h-1/2 group-hover:scale-110 transition-200 m-auto",
					selected === item[2] && "scale-110",
				)}
			/>
		</button>
		<div class="text-center font-bold w-min m-auto">{item[0]}</div>
	</div>
{/each}

<style>
	button::after {
		position: absolute;
		--g: /20.56% 20.56% radial-gradient(#000 calc(71% - 1px), #0000 71%)
			no-repeat;
		mask:
			100% 50% var(--g),
			93.301% 75% var(--g),
			75% 93.301% var(--g),
			50% 100% var(--g),
			25% 93.301% var(--g),
			6.699% 75% var(--g),
			0% 50% var(--g),
			6.699% 25% var(--g),
			25% 6.699% var(--g),
			50% 0% var(--g),
			75% 6.699% var(--g),
			93.301% 25% var(--g),
			radial-gradient(100% 100%, #000 38.366%, #0000 calc(38.366% + 1px));
		content: "";
		background-image: inherit;
		@apply absolute h-full aspect-1 m-inline-auto top-0 left-0 right-0 bottom-0 -z-1 transition-200;
	}
	button {
		background-size: 0 !important;
	}
	/* for some reason UnoCSS isn't detecting */
	button:hover::after {
		--un-rotate-x: 0;
		--un-rotate-y: 0;
		--un-rotate-z: 0;
		--un-rotate: 30deg;
		transform: translateX(var(--un-translate-x))
			translateY(var(--un-translate-y)) translateZ(var(--un-translate-z))
			rotate(var(--un-rotate)) rotateX(var(--un-rotate-x))
			rotateY(var(--un-rotate-y)) rotateZ(var(--un-rotate-z))
			skewX(var(--un-skew-x)) skewY(var(--un-skew-y)) scaleX(var(--un-scale-x))
			scaleY(var(--un-scale-y)) scaleZ(var(--un-scale-z));
	}
</style>
