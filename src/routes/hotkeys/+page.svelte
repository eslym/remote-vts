<script lang="ts">
    import { client, connectionState, vtsState } from '$lib/client';
    import ConnectionState from '$lib/coms/ConnectionState.svelte';
    import { hotkeyConfigs, type VTSHotkey, type CustomConfig } from '$lib/config';
    import Button from '$lib/coms/Button.svelte';
    import { getActionBar } from '../+layout.svelte';
    import {
        Hold04Icon,
        Move02Icon,
        Tick04Icon,
        ViewIcon,
        ViewOffSlashIcon
    } from 'hugeicons-svelte';
    import { t } from '$lib/lang';
    import { waitForEmoji } from '$lib/emoji';
    import ModalEdit from '$lib/coms/ModalEdit.svelte';
    import Draggable, { dragEffects, dragState } from '$lib/coms/Draggable.svelte';

    let configs = $derived(vtsState.loadedModel ? hotkeyConfigs[vtsState.loadedModel] : {});
    let displayHotkeys = $derived(calculateOrder(vtsState.hotkeys, configs));

    let editMode = $state(false);
    let showHidden = $state(false);

    let editModal = $state(false);
    let currentEdit: VTSHotkey | undefined = $state(undefined as any);

    let editing = $derived(
        currentEdit
            ? configs[currentEdit.hotkeyID]
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

    function calculateOrder(hotkeys: VTSHotkey[], configs: Record<string, CustomConfig>) {
        return [...hotkeys].sort((a, b) => {
            const aindex = configs[a.hotkeyID].index;
            const bindex = configs[b.hotkeyID].index;
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
        for (let i = 0; i < displayHotkeys.length; i++) {
            const cfg = configs[displayHotkeys[i].hotkeyID];
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
    {#each displayHotkeys as hotkey (hotkey.hotkeyID)}
        {@const cfg = configs[hotkey.hotkeyID]}
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
                            label={cfg.displayName || hotkey.name || hotkey.description}
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
                            label={cfg.displayName || hotkey.name || hotkey.description}
                            onclick={() => {
                                if (editMode) {
                                    currentEdit = hotkey;
                                    editModal = true;
                                    return;
                                }
                                $client.hotkeyTrigger({ hotkeyID: hotkey.hotkeyID });
                            }}
                            disabled={!editMode && !connectionState.authenticated}
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

{#await waitForEmoji() then _}
    <ModalEdit
        bind:shown={editModal}
        config={editing}
        fallbackName={editing.displayName || currentEdit?.name || currentEdit?.description}
        fallbackIcon="❔"
    />
{/await}
