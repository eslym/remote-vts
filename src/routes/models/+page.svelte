<script lang="ts">
    import { client } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import { onMount } from 'svelte';
    import type { ApiClient } from 'vtubestudio';

    let models: Awaited<ReturnType<ApiClient['availableModels']>>['availableModels'] = $state([]);
    let promise = $derived($client.availableModels().then((m) => (models = m.availableModels)));

    onMount(() => {
        function modelLoaded(data: { modelID: string }) {
            for (let i = 0; i < models.length; i++) {
                if (models[i].modelID === data.modelID) {
                    models[i].modelLoaded = true;
                } else {
                    models[i].modelLoaded = false;
                }
            }
        }
        $client.events.modelLoaded.subscribe(modelLoaded, {});
        return () => $client.events.modelLoaded.unsubscribe();
    });
</script>

<Connection>
    {#await promise}
        <div class="spinner"></div>
    {:then _}
        <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
            {#each models as model (model.modelID)}
                <button
                    class="btn btn-lg flex-col gap-2 p-6 h-auto"
                    class:btn-primary={model.modelLoaded}
                    onclick={() => {
                        $client.modelLoad(model);
                    }}
                >
                    {model.modelName}
                </button>
            {/each}
        </div>
    {/await}
</Connection>
