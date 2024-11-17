<script lang="ts">
    import { client } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import { onMount } from 'svelte';
    import { type ApiClient } from 'vtubestudio';

    let states: Awaited<ReturnType<ApiClient['hotkeysInCurrentModel']>> = $state({
        modelID: '',
        expressions: []
    } as any);
    let promise: Promise<any> = $state(undefined as any);

    onMount(() => {
        promise = $client.hotkeysInCurrentModel({}).then((e) => (states = e));
        $client.events.modelLoaded.subscribe(() => {
            promise = $client.hotkeysInCurrentModel({}).then((e) => (states = e));
        }, {});
        return () => {
            $client.events.modelLoaded.unsubscribe();
        };
    });
</script>

<Connection>
    {#await promise}
        <div class="spinner"></div>
    {:then _}
        <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
            {#each states.availableHotkeys as hk (`${states.modelID}/${hk.hotkeyID}`)}
                <button
                    class="btn btn-lg flex-col gap-2 p-6 h-auto"
                    onclick={() => {
                        $client.hotkeyTrigger({
                            hotkeyID: hk.hotkeyID
                        });
                    }}
                >
                    {hk.name || hk.file || hk.description}
                </button>
            {/each}
        </div>
    {/await}
</Connection>
