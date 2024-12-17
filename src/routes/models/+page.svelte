<script lang="ts">
    import { client, connected } from '$lib/client';
    import Button from '$lib/coms/Button.svelte';
    import Connection from '$lib/coms/Connected.svelte';
    import { currentModel, modelConfigs, models, type VTSModel } from '$lib/config';
    import { t } from '$lib/lang';
    import { onMount } from 'svelte';
    import { ErrorCode, VTubeStudioError } from 'vtubestudio';

    let displayModels = $derived(calculateSortedOrders($models));

    let buttons: Record<string, HTMLButtonElement> = $state({});

    let tooFast = $state(false);

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
                    label={cfg.displayName || model.modelName}
                    active={model.modelID === $currentModel}
                    onclick={async () => {
                        try {
                            await $client.modelLoad(model);
                        } catch (e) {
                            if (
                                e instanceof VTubeStudioError &&
                                e.data.errorID === ErrorCode.ModelLoadCooldownNotOver
                            ) {
                                tooFast = true;
                                return;
                            }
                            throw e;
                        }
                    }}
                    disabled={!$connected}
                    bind:element={buttons[model.modelID]}
                />
            {/if}
        {/each}
    </div>
</Connection>

<input class="modal-state" id="model-cooldown" type="checkbox" bind:checked={tooFast} />
<div class="modal">
    <label class="modal-overlay" for="model-cooldown"></label>
    <div class="modal-content flex flex-col gap-5">
        <label for="model-cooldown" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >✕</label
        >
        <h2 class="text-xl">{$t.hint.model_cooldown.title}</h2>
        <span>{$t.hint.model_cooldown.description}</span>
        <div class="flex gap-3">
            <label for="model-cooldown" class="btn btn-block">
                {$t.hint.model_cooldown.confirm}
            </label>
        </div>
    </div>
</div>
