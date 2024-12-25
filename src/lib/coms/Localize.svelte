<script lang="ts">
    import { lang } from '$lib/lang';
    import type { Snippet } from 'svelte';

    let lng = $derived($lang.replace(/\-/g, '_'));

    let prop: Record<string, string | number | Snippet<[]>> = $props();

    let child = $derived(prop[lng] || prop['children']);
</script>

{#if child instanceof Function}
    {@render child()}
{:else}
    {child}
{/if}
