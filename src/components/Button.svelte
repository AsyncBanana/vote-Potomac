<script script lang="ts">
	export let href: string | undefined = undefined;
	export let type: 'primary' | 'secondary' | 'tertiary' | 'borderless' | 'link' = 'primary';
	export let ariaLabel: string | undefined = undefined;
	export let disabled: boolean | undefined = undefined;
	export let action: 'button' | 'submit' | 'reset' | undefined = undefined;
	export let title: string | undefined = undefined;
	export let fullWidth: boolean = false;
	export let square = !$$slots?.default;
	export let nonInteractive = false;
	export let id: string | undefined = undefined;
	export let icon: string = "";
	export let vertical: boolean = false;
	let className = '';
	export { className as class };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element
	this={nonInteractive?'div':(href ? 'a' : 'button')}
	class="btn{className?` ${className}`:''}"
	class:pointer-events-none={nonInteractive}
    class:btn-primary={type==="primary"}
    class:btn-neutral={type==="secondary"}
    class:btn-outline={type==="tertiary"}
    class:btn-link={type==="link"}
	class:btn-square={square}
    class:btn-block={fullWidth}
	class:flex-col={vertical}
	on:click
	on:mousedown
	on:mouseup
	aria-label={ariaLabel}
	type={action}
	{disabled}
	{href}
	{title}
	{id}
	>{#if icon}<span class="{icon} h-6 w-6 {$$slots.default&&!vertical ? 'mr-1' : ''}" />{/if}<span id="text"><slot /></span>
</svelte:element>
