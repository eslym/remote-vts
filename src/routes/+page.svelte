<script lang="ts">
    import { Settings01Icon, DashboardSquare01Icon, SmileIcon, UserIcon } from 'hugeicons-svelte';
    import { t } from '$lib/lang';
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4" data-sveltekit-replacestate>
    <a href="/hotkeys" class="btn flex-col gap-2 p-6 h-auto">
        <DashboardSquare01Icon size={45} />
        <span>{t.menu.hotkeys}</span>
    </a>
    <a href="/expressions" class="btn flex-col gap-2 p-6 h-auto">
        <SmileIcon size={45} />
        <span>{t.menu.expressions}</span>
    </a>
    <a href="/models" class="btn flex-col gap-2 p-6 h-auto">
        <UserIcon size={45} />
        <span>{t.menu.models}</span>
    </a>
    <a href="/settings" class="btn flex-col gap-2 p-6 h-auto">
        <Settings01Icon size={45} />
        <span>{t.menu.settings}</span>
    </a>
</div>
