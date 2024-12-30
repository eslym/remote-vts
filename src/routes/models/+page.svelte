<script lang="ts">
    import { client, connectionState, vtsState } from '$lib/client';
    import Button from '$lib/coms/Button.svelte';
    import ConnectionState from '$lib/coms/ConnectionState.svelte';
    import { modelConfigs, type CustomConfig, type VTSModel } from '$lib/config';
    import { t } from '$lib/lang';
    import {
        Tick04Icon,
        Move02Icon,
        Hold04Icon,
        ViewOffSlashIcon,
        ViewIcon
    } from 'hugeicons-svelte';
    import { onMount } from 'svelte';
    import { ErrorCode, VTubeStudioError } from 'vtubestudio';
    import { getActionBar } from '../+layout.svelte';
    import ModalEdit from '$lib/coms/ModalEdit.svelte';
    import { waitForEmoji } from '$lib/emoji';
    import Draggable, { dragEffects, dragState } from '$lib/coms/Draggable.svelte';

    let displayModels = $derived(calculateSortedOrders(vtsState.models));

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
        showHidden = false;
    });

    function calculateSortedOrders(models: VTSModel[]) {
        return [...models].sort((a, b) => {
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

    $effect(() => {
        for (let i = 0; i < displayModels.length; i++) {
            const cfg = modelConfigs[displayModels[i].modelID];
            if (cfg.hidden) continue;
            if (cfg.index !== i) {
                cfg.index = i;
            }
        }
    });

    onMount(() => {
        if (vtsState.loadedModel && buttons[vtsState.loadedModel]) {
            buttons[vtsState.loadedModel].scrollIntoView({ block: 'center' });
        }
    });
</script>

{#snippet actionBtns()}
    {#if editMode}
        <div class="dropdown-container">
            <div class="dropdown">
                <button
                    class="btn btn-solid-success btn-circle popover-trigger transition-colors size-10 opacity-60"
                >
                    <Tick04Icon size={20} />
                </button>
                <div class="dropdown-menu dropdown-menu-bottom-left">
                    <button
                        class="dropdown-item text-sm"
                        onclick={() => {
                            editMode = false;
                            showHidden = false;
                        }}
                    >
                        {t.actions.done_edit}
                    </button>
                    <label
                        tabindex="-1"
                        class="dropdown-item text-sm flex flex-row justify-between"
                    >
                        {t.hint.show_hidden}
                        <input
                            tabindex="-1"
                            type="checkbox"
                            class="switch"
                            bind:checked={showHidden}
                        />
                    </label>
                </div>
            </div>
        </div>
    {/if}
{/snippet}

{#if !editMode}
    <ConnectionState />
{/if}

<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
    {#each displayModels as model (model.modelID)}
        {@const cfg = modelConfigs[model.modelID]}
        {#if cfg.hidden === showHidden}
            <Draggable dragValue={cfg}>
                {#snippet draggingView(state)}
                    <div
                        class="absolute pointer-events-none"
                        style:left="{state.cursor.x}px"
                        style:top="{state.cursor.y}px"
                        style:margin-left="-{state.offset.x}px"
                        style:margin-top="-{state.offset.y}px"
                        style:width="{state.dimensions.width}px"
                        style:height="{state.dimensions.height}px"
                    >
                        <Button
                            icon={cfg.icon}
                            label={cfg.displayName || model.modelName}
                            active={model.modelID === vtsState.loadedModel}
                            disabled={false}
                            clickable={false}
                        >
                            <div
                                class="absolute -left-1 -top-1 size-10 bg-gray-6 rounded-full flex items-center justify-center"
                            >
                                <Hold04Icon size={20} />
                            </div>
                        </Button>
                    </div>
                {/snippet}
                {#snippet children({ dragHandle, dragTarget, isDragging })}
                    <div
                        class="relative"
                        class:opacity-40={isDragging}
                        class:scale-90={isDragging}
                        use:dragEffects
                        use:dragTarget
                        ondraggingover={() => {
                            const src = dragState.dragValue as CustomConfig;
                            if (src.index === cfg.index) return;
                            const i = src.index;
                            src.index = cfg.index;
                            cfg.index = i;
                        }}
                    >
                        <Button
                            icon={cfg.icon}
                            label={cfg.displayName || model.modelName}
                            active={model.modelID === vtsState.loadedModel}
                            onclick={modelClicked.bind(null, model)}
                            disabled={!editMode && !connectionState.authenticated}
                            clickable={!isDragging}
                            bind:element={buttons[model.modelID]}
                        />
                        {#if (editMode && !dragState.dragging) || isDragging}
                            {@const HideIcon = cfg.hidden ? ViewIcon : ViewOffSlashIcon}
                            {#if !showHidden}
                                <div
                                    class="absolute -left-1 -top-1 size-10 bg-gray-6 rounded-full flex items-center justify-center"
                                    class:opacity-0={isDragging}
                                    use:dragHandle
                                >
                                    <Move02Icon size={20} />
                                </div>
                            {/if}
                            <button
                                class="btn btn-circle btn-secondary absolute -right-1 -top-1"
                                class:opacity-0={isDragging}
                                onclick={() => {
                                    cfg.hidden = !cfg.hidden;
                                }}
                            >
                                <HideIcon size={20} />
                            </button>
                        {/if}
                    </div>
                {/snippet}
            </Draggable>
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
        <h2 class="text-sm font-semibold">{t.hint.model_cooldown.title}</h2>
        <span>{t.hint.model_cooldown.description}</span>
        <div class="flex gap-3">
            <label for="modal-cooldown" class="btn btn-block">
                {t.hint.model_cooldown.confirm}
            </label>
        </div>
    </div>
</div>

{#await waitForEmoji() then _}
    <ModalEdit
        bind:shown={editModal}
        config={editing}
        fallbackName={currentEdit?.modelName}
        fallbackIcon="❔"
    />
{/await}
