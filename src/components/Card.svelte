<script lang="ts">
	export let image:
		| {
				src: string;
				alt: string;
		  }
		| undefined = undefined;
	export let title: string;
	export let subtitle: string;
	export let id: string | undefined = undefined;
</script>

<div class="card bg-base-200 shadow-xl" {id}>
	{#if image}
		<figure><img src={image.src} alt={image.alt} /></figure>
	{/if}
	<div class="card-body">
		{#if subtitle}
			<span class="flex flex-col"
				>{#if title}<h2 class="card-title">{title}</h2>{/if}
				<h3 class="text-sm text-slate-600">{subtitle}</h3></span
			>
		{:else if title}<h2 class="card-title">{title}</h2>{/if}
		<p class="max-w-full text-wrap overflow-x-auto"><slot /></p>
		{#if "actions" in $$slots}
			<div class="card-actions justify-end">
				<slot name="actions" />
			</div>
		{/if}
	</div>
</div>
