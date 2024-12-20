<script lang="ts">
    import { client, connected } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import {
        currentModel,
        expressions,
        expressionConfigs,
        type CustomConfig,
        type VTSExpression
    } from '$lib/config';
    import Button from '$lib/coms/Button.svelte';
    import { getActionBar } from '../+layout.svelte';
    import { Tick04Icon, PencilEdit01Icon, Move02Icon, Hold04Icon } from 'hugeicons-svelte';
    import { t } from '$lib/lang';
    import { waitForEmoji } from '$lib/emoji';
    import ModalEdit from '$lib/coms/ModalEdit.svelte';
    import Draggable, { dragEffects, dragState } from '$lib/coms/Draggable.svelte';

    let editMode = $state(false);
    let showHidden = $state(false);
    let editModal = $state(false);
    let currentEdit: VTSExpression | undefined = $state(undefined as any);

    let configs = $derived($currentModel ? expressionConfigs[$currentModel] : {});
    let displayExpressions = $state(calculateOrder($currentModel ? $expressions : []));

    let editing = $derived(
        currentEdit
            ? configs[currentEdit.file]
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

    function calculateOrder(expressions: VTSExpression[]) {
        return expressions.sort((a, b) => {
            const aindex = configs[a.file].index;
            const bindex = configs[b.file].index;
            if (aindex !== null && bindex !== null) {
                return aindex - bindex;
            }
            if (aindex !== null) {
                return -1;
            }
            if (bindex !== null) {
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
    }

    $effect(() => {
        for (let i = 0; i < displayExpressions.length; i++) {
            const cfg = configs[displayExpressions[i].file];
            if (cfg.index !== i) {
                cfg.index = i;
            }
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
                    <button class="dropdown-item text-sm" onclick={() => (editMode = false)}>
                        {$t.actions.done_edit}
                    </button>
                    <label
                        tabindex="-1"
                        class="dropdown-item text-sm flex flex-row justify-between"
                    >
                        {$t.hint.show_hidden}
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
    <Connection />
{/if}

<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
    {#each displayExpressions as expression (expression.file)}
        {@const cfg = configs[expression.file]}
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
                            label={cfg.displayName || expression.name || expression.file}
                            active={expression.active}
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
                        use:dragEffects
                        use:dragTarget
                        ondraggingover={() => {
                            const src = dragState.dragValue as CustomConfig;
                            if (src.index === cfg.index) return;
                            const i = src.index;
                            src.index = cfg.index;
                            cfg.index = i;
                            displayExpressions = calculateOrder(displayExpressions);
                        }}
                    >
                        <Button
                            icon={cfg.icon}
                            label={cfg.displayName || expression.name || expression.file}
                            active={expression.active}
                            onclick={async () => {
                                await $client.expressionActivation({
                                    expressionFile: expression.file,
                                    active: !expression.active
                                });
                                $client
                                    .expressionState({ details: true })
                                    .then((e) => ($expressions = e.expressions));
                            }}
                            disabled={!editMode && !$connected}
                            clickable={!editMode}
                        />

                        {#if (editMode && !dragState.dragging) || isDragging}
                            <div
                                class="absolute -left-1 -top-1 size-10 bg-gray-6 rounded-full flex items-center justify-center"
                                class:opacity-0={isDragging}
                                use:dragHandle
                            >
                                <Move02Icon size={20} />
                            </div>
                            <button
                                class="btn btn-circle btn-secondary absolute -right-1 -bottom-1"
                                class:opacity-0={isDragging}
                                onclick={() => {
                                    currentEdit = expression;
                                    editModal = true;
                                }}
                            >
                                <PencilEdit01Icon size={20} />
                            </button>
                        {/if}
                    </div>
                {/snippet}
            </Draggable>
        {/if}
    {/each}
</div>

{#await waitForEmoji() then _}
    <ModalEdit
        bind:shown={editModal}
        config={editing}
        fallbackName={editing.displayName || currentEdit?.name || currentEdit?.file}
        fallbackIcon="❔"
    />
{/await}
