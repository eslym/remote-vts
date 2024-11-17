<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import {
        RemoteControlIcon,
        Settings01Icon,
        Menu01Icon,
        DashboardSquare01Icon,
        SmileIcon,
        UserIcon,
        ConnectIcon,
        CheckmarkCircle01Icon,
        Alert02Icon
    } from 'hugeicons-svelte';
    import { t } from '$lib/lang';
    interface Props {
        children?: import('svelte').Snippet;
    }
    import { version } from '$app/environment';
    import { connected } from '$lib/client';

    let { children }: Props = $props();

    let title = $derived($page.data.title);
    let group = $derived($page.data.group);

    let sidebar = $state(false);

    afterNavigate(() => (sidebar = false));
</script>

<svelte:head>
    {#if title}
        <title>{$title} | {$t.name}</title>
    {:else}
        <title>{$t.name}</title>
    {/if}
</svelte:head>

<div class="flex flex-row">
    <div class="md:w-full md:max-w-[18rem]">
        <input
            type="checkbox"
            id="sidebar-mobile-fixed"
            class="sidebar-state"
            bind:checked={sidebar}
        />
        <label for="sidebar-mobile-fixed" class="sidebar-overlay"></label>
        <aside
            class="sidebar sidebar-fixed-left sidebar-mobile h-full justify-start max-md:fixed max-md:-translate-x-full"
            data-sveltekit-replacestate
        >
            <section class="sidebar-title items-center p-4">
                <RemoteControlIcon class="p-0.5 mr-0.5" size={42} />
                <div class="flex flex-col">
                    <span>{$t.name}</span>
                    <span class="text-xs font-normal text-content2 truncate">
                        Rev. {version.substring(0, 7)}
                    </span>
                </div>
            </section>
            <section class="sidebar-content flex-grow">
                <nav class="menu rounded-md">
                    <section class="menu-section px-4">
                        <ul class="menu-items">
                            <li class="contents">
                                <a
                                    href="/hotkeys"
                                    class="menu-item"
                                    class:menu-active={group === 'hotkeys'}
                                >
                                    <DashboardSquare01Icon class="h-5 w-5 opacity-75" />
                                    <span>{$t.menu.hotkeys}</span>
                                </a>
                                <a
                                    href="/expressions"
                                    class="menu-item"
                                    class:menu-active={group === 'expressions'}
                                >
                                    <SmileIcon class="h-5 w-5 opacity-75" />
                                    <span>{$t.menu.expressions}</span>
                                </a>
                                <a
                                    href="/models"
                                    class="menu-item"
                                    class:menu-active={group === 'models'}
                                >
                                    <UserIcon class="h-5 w-5 opacity-75" />
                                    <span>{$t.menu.models}</span>
                                </a>
                            </li>
                        </ul>
                    </section>
                </nav>
            </section>
            <section class="sidebar-footer sidebar-content h-max justify-end bg-gray-2 pt-2">
                <nav class="menu">
                    <section class="menu-section px-4">
                        <ul class="menu-items">
                            <li class="contents">
                                <a
                                    href="/settings"
                                    class="menu-item"
                                    class:menu-active={group === 'settings'}
                                >
                                    <Settings01Icon class="h-5 w-5 opacity-75" />
                                    <span>{$t.menu.settings}</span>
                                </a>
                            </li>
                        </ul>
                    </section>
                </nav>
            </section>
        </aside>
    </div>
    <div class="w-full">
        <div class="navbar sticky top-1 z-40 md:pl-4">
            <div class="navbar-start">
                <label
                    for="sidebar-mobile-fixed"
                    class="btn btn-ghost btn-circle md:hidden pointer-events-auto"
                >
                    <Menu01Icon />
                </label>
                <span class="navbar-item pointer-events-none">
                    {$title ?? $t.name}
                </span>
            </div>
            <div class="navbar-end">
                <div class="popover">
                    <button
                        class="btn btn-ghost btn-circle popover-trigger transition-colors"
                        class:text-success={$connected}
                        class:text-error={!$connected}
                    >
                        {#if $connected}
                            <ConnectIcon size={16} />
                        {:else}
                            <Alert02Icon size={16} />
                        {/if}
                    </button>
                    <div class="popover-content popover-bottom-left top-12">
                        <div class="popover-arrow"></div>
                        <div class="p-2 text-sm flex flex-row items-center">
                            <span class="flex-grow">
                                {$connected
                                    ? $t.hint.status.connected
                                    : $t.hint.status.disconnected}
                            </span>
                            {#if $connected}
                                <CheckmarkCircle01Icon size={16} class="text-success" />
                            {:else}
                                <Alert02Icon size={16} class="text-error" />
                            {/if}
                        </div>
                        {#if !$connected}
                            <p class="px-2 pb-2 text-xs text-content3 text-justify">
                                {$t.hint.status.instruction}
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
        <div class="px-2 pb-12 md:pl-6 pt-8">
            {@render children?.()}
        </div>
    </div>
</div>
