<script lang="ts">
    import { client, connected } from '$lib/client';
    import Button from '$lib/coms/Button.svelte';
    import Connection from '$lib/coms/Connected.svelte';
    import { currentModel, modelConfigs, models, type VTSModel } from '$lib/config';
    import { onMount } from 'svelte';

    let displayModels = $derived(calculateSortedOrders($models));

    let buttons: Record<string, HTMLButtonElement> = $state({});

    function calculateSortedOrders(models: VTSModel[]) {
        return models.sort((a, b) => {
            const aindex = modelConfigs[a.modelID].index;
            const bindex = modelConfigs[b.modelID].index;
            if (aindex !== null && bindex !== null) {
                return aindex - bindex;
            }
            if (aindex !== null) {
                return -1;
            }
            if (bindex !== null) {
                return 1;
            }
            return a.modelName.localeCompare(b.modelName);
        });
    }

    onMount(() => {
        if ($currentModel && buttons[$currentModel]) {
            buttons[$currentModel].scrollIntoView({ block: 'center' });
        }
    });
</script>

<Connection>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {#each displayModels as model (model.modelID)}
            {@const cfg = modelConfigs[model.modelID]}
            {#if !cfg.hidden}
                <Button
                    icon={cfg.icon}
                    label={cfg.displayName ?? model.modelName}
                    active={model.modelID === $currentModel}
                    onclick={() => $client.modelLoad(model)}
                    disabled={!$connected}
                    bind:element={buttons[model.modelID]}
                />
            {/if}
        {/each}
    </div>
</Connection>
