<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        label,
        icon = undefined,
        disabled = false,
        active = false,
        element = $bindable(undefined as any),
        onclick = undefined,
        oncontextmenu = undefined,
        clickable = true,
        children = undefined
    }: {
        label: string;
        icon?: string | null | undefined;
        disabled?: boolean;
        active?: boolean;
        element?: HTMLButtonElement;
        onclick?: (ev: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
        oncontextmenu?: (ev: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
        clickable?: boolean;
        children?: Snippet<[]>;
    } = $props();
</script>

<button
    bind:this={element}
    class="btn btn-lg flex-col gap-2.5 p-6 h-auto w-full"
    class:btn-primary={active}
    class:pointer-events-none={!clickable}
    {disabled}
    {onclick}
    {oncontextmenu}
>
    <span class="font-emoji text-5xl">{icon || '❔'}</span>
    <span class="text-xs">{label}</span>
    {@render children?.()}
</button>
