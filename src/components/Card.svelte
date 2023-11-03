<script lang="ts">
    export let image: {
        src: string,
        alt: string
    } | undefined = undefined
    export let title: string;
</script>
<div class="card bg-base-200 shadow-xl">
    {#if image}
    <figure><img src={image.src} alt={image.alt}/></figure>
    {/if}
    <div class="card-body">
      <h2 class="card-title">{title}</h2>
      <p><slot/></p>
      {#if ("actions" in $$slots)}
      <div class="card-actions justify-end">
        <slot name="actions"/>
      </div>
      {/if}
    </div>
  </div>
