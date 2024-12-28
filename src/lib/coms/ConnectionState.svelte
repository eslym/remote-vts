<script lang="ts">
    import { connectionState } from '$lib/client';
    import { t } from '$lib/lang';
    import { Alert01Icon } from 'hugeicons-svelte';
    import type { Snippet } from 'svelte';

    let { children = undefined }: { children?: Snippet } = $props();
</script>

{#if !connectionState.connected}
    <div class="alert alert-warning mb-8 sticky z-30 top-0" data-sveltekit-replacestate>
        <Alert01Icon size={35} class="text-warning min-w-max" />
        <div class="flex flex-col">
            <span>{$t.status.disconnected.title}</span>
            <span class="text-content2 text-sm text-justify">
                {@html $t.status.disconnected.description}
            </span>
        </div>
    </div>
{:else if !connectionState.authenticated}
    <div class="alert alert-warning mb-8 sticky z-30 top-0" data-sveltekit-replacestate>
        <Alert01Icon size={35} class="text-warning min-w-max" />
        <div class="flex flex-col">
            <span>{$t.status.unauthenticated.title}</span>
            <span class="text-content2 text-sm text-justify">
                {@html $t.status.unauthenticated.description}
            </span>
        </div>
    </div>
{/if}

{@render children?.()}
