<script lang="ts">
    import { client, connected } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import { currentModel, hotkeys } from '$lib/config';
</script>

<Connection>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {#each $hotkeys as hk (`${$currentModel}/${hk.hotkeyID}`)}
            <button
                class="btn btn-lg flex-col gap-2 p-6 h-auto"
                onclick={() => {
                    $client.hotkeyTrigger({
                        hotkeyID: hk.hotkeyID
                    });
                }}
                disabled={!$connected}
            >
                {hk.name || hk.file || hk.description}
            </button>
        {/each}
    </div>
</Connection>
