<script lang="ts">
    import type { CustomConfig } from '$lib/config';
    import {
        emojiGroups,
        emojiMeta,
        searchEmoji,
        type EmojiMeta,
        type EmojiRecord
    } from '$lib/emoji';
    import { t } from '$lib/lang';

    let {
        config,
        id = 'modal-edit',
        fallbackName = '',
        fallbackIcon = '',
        shown = $bindable(false)
    }: {
        config: CustomConfig;
        id?: string;
        fallbackName?: string;
        fallbackIcon?: string;
        shown?: boolean;
    } = $props();

    let emojiPicker = $state(false);
    let emojiSearch = $state('');
    let emojiGroup = $state(0);
    let emojiVariants: string[] = $state.raw([]);

    let searchResult: EmojiRecord[] = $derived(searchEmoji(emojiSearch));

    let emojiDiv: HTMLDivElement | undefined = $state(undefined);

    let groups = [
        {
            icon: '😀',
            emojis: emojiGroups[0].emojis
        },
        {
            icon: '👍',
            emojis: emojiGroups[1].emojis
        },
        {
            icon: '🐶',
            emojis: emojiGroups[3].emojis
        },
        {
            icon: '🍔',
            emojis: emojiGroups[4].emojis
        },
        {
            icon: '🚀',
            emojis: emojiGroups[5].emojis
        },
        {
            icon: '🎉',
            emojis: emojiGroups[6].emojis
        },
        {
            icon: '🧻',
            emojis: emojiGroups[7].emojis
        },
        {
            icon: '⁉️',
            emojis: emojiGroups[8].emojis
        },
        {
            icon: '🚩',
            emojis: emojiGroups[9].emojis
        }
    ];

    $effect(() => {
        if (!shown) {
            emojiPicker = false;
        }
    });

    $effect(() => {
        if (!emojiPicker) {
            emojiSearch = '';
            emojiGroup = 0;
            emojiVariants = [];
            emojiDiv?.scrollTo(0, 0);
        }
    });

    $effect(() => {
        if (emojiSearch) {
            emojiVariants = [];
        } else {
            emojiGroup = 0;
        }
    });
</script>

<input class="modal-state" {id} type="checkbox" bind:checked={shown} />
<div class="modal">
    <label class="modal-overlay" for={id}></label>
    <div class="modal-content flex flex-col gap-5 w-[90vw]">
        <label for={id} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
        <h2 class="text-sm font-semibold">{t.hint.modal_edit.title} {fallbackName}</h2>
        <div class="form-group">
            <div class="form-field">
                <label class="form-label" for="{id}-name">{t.hint.modal_edit.display_name}</label>
                <input
                    type="text"
                    id="{id}-name"
                    class="input input-block input-solid"
                    placeholder={fallbackName}
                    bind:value={config.displayName}
                />
            </div>
            <div class="form-field">
                <label class="form-label" for="{id}-emoji-picker">{t.hint.modal_edit.icon}</label>
                <label
                    for="{id}-emoji-picker"
                    class="textarea text-5xl textarea-block textarea-solid font-emoji flex items-center justify-center"
                >
                    {config.icon || fallbackIcon}
                </label>
            </div>
        </div>
    </div>
</div>

{#snippet emojiButton(unicode: string, meta?: EmojiMeta)}
    {@const m = meta ?? emojiMeta.get(unicode)}
    <div>
        <button
            class="btn btn-lg btn-circle btn-ghost"
            onclick={() => {
                if (!emojiVariants.length && m?.variants?.length) {
                    emojiVariants = [unicode, ...m.variants];
                    return;
                }
                config.icon = unicode;
                emojiPicker = false;
            }}
        >
            {unicode}
        </button>
    </div>
{/snippet}

{#snippet variantsButton()}
    {#if emojiVariants.length}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
            tabindex="-1"
            class="absolute inset-0 bg-gray-1/50 backdrop-blur-sm"
            onclick={() => {
                emojiVariants = [];
            }}
        ></button>
        <div class="absolute inset-0 pointer-events-none p-8 flex items-center justify-center">
            <div
                class="bg-gray-3 rounded-lg shadow p-2 gap-2 w-full grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] pointer-events-auto"
            >
                {#each emojiVariants as variant}
                    {@render emojiButton(variant)}
                {/each}
            </div>
        </div>
    {/if}
{/snippet}

<input class="modal-state" id="{id}-emoji-picker" type="checkbox" bind:checked={emojiPicker} />
<div class="modal">
    <label class="modal-overlay" for="{id}-emoji-picker"></label>
    <div class="modal-content flex flex-col gap-5 w-[90vw] h-[60vh]">
        <label
            for="{id}-emoji-picker"
            class="btn btn-xs btn-circle btn-ghost absolute right-2 top-2">✕</label
        >
        <h2 class="text-sm font-semibold">{t.hint.modal_edit.pick_icon}</h2>
        <input
            type="text"
            class="input input-sm input-block input-solid"
            placeholder={t.hint.modal_edit.search_emoji}
            bind:value={emojiSearch}
        />
        {#if emojiSearch}
            {#if searchResult.length > 0}
                <div class="flex-grow relative h-0 flex items-start justify-stretch">
                    {#key emojiSearch}
                        <div
                            class="w-full overflow-y-auto gap-0.5 grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))]"
                        >
                            {#each searchResult as emoji}
                                {@render emojiButton(emoji.unicode, emoji.meta)}
                            {/each}
                        </div>
                    {/key}
                    {@render variantsButton()}
                </div>
            {:else}
                <div class="flex-grow flex items-center justify-center">
                    <p class="text-lg text-content3">{t.hint.modal_edit.no_icon}</p>
                </div>
            {/if}
        {:else}
            <div class="h-0 flex-grow flex flex-col gap-1.5 relative">
                <div class="w-full">
                    <div
                        class="tabs tabs-boxed grid grid-cols-[repeat(9,1fr)] gap-0 overflow-auto w-full"
                    >
                        {#each groups as group, index}
                            <button
                                class="tab text-sm p-2 justify-center"
                                class:tab-active={emojiGroup === index}
                                onclick={() => {
                                    emojiGroup = index;
                                    emojiVariants = [];
                                    emojiDiv!.scrollTop = 0;
                                }}
                            >
                                {group.icon}
                            </button>
                        {/each}
                    </div>
                </div>
                <div
                    bind:this={emojiDiv}
                    class="overflow-y-auto flex-grow gap-0.5 grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] h-0"
                >
                    {#each groups[emojiGroup].emojis as emoji}
                        {@render emojiButton(emoji)}
                    {/each}
                </div>
                {@render variantsButton()}
            </div>
        {/if}
    </div>
</div>
