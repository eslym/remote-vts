<script lang="ts">
    let {
        label,
        icon = undefined,
        disabled = false,
        active = false,
        element = $bindable(undefined as any),
        onclick = undefined,
        oncontextmenu = undefined
    }: {
        label: string;
        icon?: string | null | undefined;
        disabled?: boolean;
        active?: boolean;
        element?: HTMLButtonElement;
        onclick?: (ev: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
        oncontextmenu?: (ev: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
    } = $props();
</script>

<button
    bind:this={element}
    class="btn btn-lg flex-col gap-2 p-6 h-auto"
    class:btn-primary={active}
    {disabled}
    {onclick}
    {oncontextmenu}
>
    <span class="font-emoji text-5xl">{icon ?? '❔'}</span>
    <span class="text-sm">{label}</span>
</button>
