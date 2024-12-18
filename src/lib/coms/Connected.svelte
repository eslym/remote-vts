<script lang="ts">
    import { connected } from '$lib/client';
    import { t } from '$lib/lang';
    import { Alert01Icon } from 'hugeicons-svelte';
    import type { Snippet } from 'svelte';

    let { children = undefined }: { children?: Snippet } = $props();
</script>

{#if !$connected}
    <div class="alert alert-warning mb-8 sticky z-30 top-0" data-sveltekit-replacestate>
        <Alert01Icon size={35} class="text-warning min-w-max" />
        <div class="flex flex-col">
            <span>{$t.hint.status.warning.title}</span>
            <span class="text-content2 text-sm text-justify">
                {@html $t.hint.status.warning.description}
            </span>
        </div>
    </div>
{/if}

{@render children?.()}
