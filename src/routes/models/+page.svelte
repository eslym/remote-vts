<script lang="ts">
    import { client, connected } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import { currentModel, models } from '$lib/config';
</script>

<Connection>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {#each $models as model (model.modelID)}
            <button
                class="btn btn-lg flex-col gap-2 p-6 h-auto"
                class:btn-primary={model.modelID === $currentModel}
                onclick={() => {
                    $client.modelLoad(model);
                }}
                disabled={!$connected}
            >
                {model.modelName}
            </button>
        {/each}
    </div>
</Connection>
