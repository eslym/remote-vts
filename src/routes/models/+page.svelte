<script lang="ts">
    import { client, connected } from '$lib/client';
    import Button from '$lib/coms/Button.svelte';
    import Connection from '$lib/coms/Connected.svelte';
    import { currentModel, modelConfigs, models, type VTSModel } from '$lib/config';
    import { t } from '$lib/lang';
    import { ArrowDown01Icon } from 'hugeicons-svelte';
    import { onMount } from 'svelte';
    import { ErrorCode, VTubeStudioError } from 'vtubestudio';
    import { getActionBar } from '../+layout.svelte';
    import ModalEdit from '$lib/coms/ModalEdit.svelte';

    let displayModels = $derived(calculateSortedOrders($models));

    let buttons: Record<string, HTMLButtonElement> = $state({});

    let tooFast = $state(false);

    let editMode = $state(false);
    let showHidden = $state(false);

    let editModal = $state(false);
    let currentEdit: VTSModel | undefined = $state(undefined as any);

    let editing = $derived(
        currentEdit
            ? modelConfigs[currentEdit.modelID]
            : {
                  displayName: '',
                  icon: '',
                  hidden: false,
                  index: null
              }
    );

    const actionBar = getActionBar();
    actionBar.snippet = actionBtns;
    actionBar.onContextMenu((ev) => {
        ev.preventDefault();
        editMode = true;
    });

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

    async function modelClicked(model: VTSModel) {
        if (editMode) {
            currentEdit = model;
            editModal = true;
            return;
        }
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
    }

    onMount(() => {
        if ($currentModel && buttons[$currentModel]) {
            buttons[$currentModel].scrollIntoView({ block: 'center' });
        }
    });
</script>

{#snippet actionBtns()}
    {#if editMode}
        <button
            class="btn btn-ghost btn-circle popover-trigger transition-colors size-10 opacity-60"
        >
            <ArrowDown01Icon size={20} />
        </button>
    {/if}
{/snippet}

{#if !editMode}
    <Connection />
{/if}

<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
    {#each displayModels as model (model.modelID)}
        {@const cfg = modelConfigs[model.modelID]}
        {#if cfg.hidden === showHidden}
            <Button
                icon={cfg.icon}
                label={cfg.displayName || model.modelName}
                active={model.modelID === $currentModel}
                onclick={modelClicked.bind(null, model)}
                disabled={!editMode && !$connected}
                bind:element={buttons[model.modelID]}
            />
        {/if}
    {/each}
</div>

<input class="modal-state" id="modal-cooldown" type="checkbox" bind:checked={tooFast} />
<div class="modal">
    <label class="modal-overlay" for="modal-cooldown"></label>
    <div class="modal-content flex flex-col gap-5">
        <label for="modal-cooldown" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >✕</label
        >
        <h2 class="text-sm font-semibold">{$t.hint.model_cooldown.title}</h2>
        <span>{$t.hint.model_cooldown.description}</span>
        <div class="flex gap-3">
            <label for="modal-cooldown" class="btn btn-block">
                {$t.hint.model_cooldown.confirm}
            </label>
        </div>
    </div>
</div>

<ModalEdit
    bind:shown={editModal}
    config={editing}
    fallbackName={currentEdit?.modelName}
    fallbackIcon="❔"
/>
