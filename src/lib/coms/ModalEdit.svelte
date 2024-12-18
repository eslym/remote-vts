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

    let searchResult: EmojiRecord[] = $derived(searchEmoji(emojiSearch));

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
        }
    });
</script>

<input class="modal-state" {id} type="checkbox" bind:checked={shown} />
<div class="modal">
    <label class="modal-overlay" for={id}></label>
    <div class="modal-content flex flex-col gap-5 w-[90vw]">
        <label for={id} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
        <h2 class="text-sm font-semibold">{$t.hint.modal_edit.title} {fallbackName}</h2>
        <div class="form-group">
            <div class="form-field">
                <label class="form-label" for="{id}-name">{$t.hint.modal_edit.display_name}</label>
                <input
                    type="text"
                    id="{id}-name"
                    class="input input-block input-solid"
                    placeholder={fallbackName}
                    bind:value={config.displayName}
                />
            </div>
            <div class="form-field">
                <label class="form-label" for="{id}-emoji-picker">{$t.hint.modal_edit.icon}</label>
                <label
                    for="{id}-emoji-picker"
                    class="textarea text-5xl w-full textarea-solid font-emoji flex items-center justify-center"
                >
                    {config.icon || fallbackIcon}
                </label>
            </div>
            <div class="form-field">
                <label class="form-label">
                    {$t.hint.modal_edit.hidden}
                    <input type="checkbox" class="switch" bind:checked={config.hidden} />
                </label>
            </div>
        </div>
    </div>
</div>

{#snippet emojiButton(unicode: string, meta?: EmojiMeta)}
    {@const m = meta ?? emojiMeta.get(unicode)!}
    <div>
        <button
            class="btn btn-lg btn-circle btn-ghost"
            onclick={() => {
                config.icon = unicode;
                emojiPicker = false;
            }}
        >
            {unicode}
        </button>
    </div>
{/snippet}

<input class="modal-state" id="{id}-emoji-picker" type="checkbox" bind:checked={emojiPicker} />
<div class="modal">
    <label class="modal-overlay" for="{id}-emoji-picker"></label>
    <div class="modal-content flex flex-col gap-5 w-[90vw] h-[50vh]">
        <label
            for="{id}-emoji-picker"
            class="btn btn-xs btn-circle btn-ghost absolute right-2 top-2">✕</label
        >
        <h2 class="text-sm font-semibold">{$t.hint.modal_edit.pick_icon}</h2>
        <input
            type="text"
            class="input input-sm input-block input-solid"
            placeholder={$t.hint.modal_edit.search_emoji}
            bind:value={emojiSearch}
        />
        {#if emojiSearch}
            <div
                class="overflow-y-auto flex-grow gap-0.5 grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] h-0"
            >
                {#each searchResult as emoji}
                    {@render emojiButton(emoji.unicode, emoji.meta)}
                {/each}
            </div>
        {:else}
            <div class="w-full">
                <div
                    class="tabs tabs-boxed grid grid-cols-[repeat(9,1fr)] gap-0 overflow-auto w-full"
                >
                    {#each groups as group, index}
                        <button
                            class="tab text-sm p-2 justify-center"
                            class:tab-active={emojiGroup === index}
                            onclick={() => (emojiGroup = index)}
                        >
                            {group.icon}
                        </button>
                    {/each}
                </div>
            </div>
            <div
                class="overflow-y-auto flex-grow gap-0.5 grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] h-0"
            >
                {#each groups[emojiGroup].emojis as emoji}
                    {@render emojiButton(emoji)}
                {/each}
            </div>
        {/if}
    </div>
</div>
