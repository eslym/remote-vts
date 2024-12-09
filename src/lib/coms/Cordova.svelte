<script lang="ts">
    import { cordovaAvailable } from '$lib/cordova';
    import type { Snippet } from 'svelte';

    interface Props {
        children?: Snippet;
        notAvailable?: Snippet;
    }

    let { children = undefined, notAvailable = undefined }: Props = $props();
</script>

{#await cordovaAvailable then available}
    {#if available}
        {@render children?.()}
    {:else}
        {@render notAvailable?.()}
    {/if}
{/await}
