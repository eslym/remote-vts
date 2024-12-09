<script lang="ts">
    import { page } from '$app/stores';
    import {
        Settings01Icon,
        DashboardSquare01Icon,
        SmileIcon,
        UserIcon,
        ConnectIcon,
        CheckmarkCircle01Icon,
        Alert02Icon,
        LinkBackwardIcon
    } from 'hugeicons-svelte';
    import { t } from '$lib/lang';
    import { scheme } from '$lib/theme';
    interface Props {
        children?: import('svelte').Snippet;
    }
    import { connected } from '$lib/client';
    import { updateAvailable } from '$lib/sw';
    import { sineInOut } from 'svelte/easing';

    let { children }: Props = $props();

    let canGoBack = $derived($page.state.canGoBack);

    let title = $derived($page.data.title);
    let group = $derived($page.data.group);
    let back = $derived($page.data.back);

    function handleBack(ev: MouseEvent) {
        if (ev.button !== 0) return;
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
        if (!canGoBack) return;
        ev.preventDefault();
        history.back();
    }

    function backButton(node: HTMLElement) {
        const width = node.getBoundingClientRect().width;
        const opacity = 0.6;

        return {
            duration: 150,
            easing: sineInOut,
            css: (t: number, u: number) => {
                return `
                    margin-left: -${width * u}px;
                    opacity: ${t * opacity};
                `;
            }
        };
    }

    let menu = $derived([
        {
            title: $t.menu.hotkeys,
            href: '/hotkeys',
            Icon: DashboardSquare01Icon,
            group: 'hotkeys'
        },
        {
            title: $t.menu.expressions,
            href: '/expressions',
            Icon: SmileIcon,
            group: 'expressions'
        },
        {
            title: $t.menu.models,
            href: '/models',
            Icon: UserIcon,
            group: 'models'
        },
        {
            title: $t.menu.settings,
            href: '/settings',
            Icon: Settings01Icon,
            group: 'settings'
        }
    ]);
</script>

<svelte:head>
    {#if title}
        <title>{$title} | {$t.name}</title>
    {:else}
        <title>{$t.name}</title>
    {/if}
    {#if $scheme === 'light'}
        <meta name="theme-color" content="#fcfcfc" />
    {:else}
        <meta name="theme-color" content="#161616" />
    {/if}
</svelte:head>

<div class="w-full h-screen grid grid-rows-[auto_1fr_auto] overflow-hidden">
    <div class="navbar z-40 md:pl-4">
        <div class="navbar-start">
            {#if back}
                <a
                    href={back}
                    class="btn btn-ghost btn-circle popover-trigger transition-colors size-10 opacity-60"
                    onclick={handleBack}
                    transition:backButton
                    title={$t.actions.back}
                >
                    <LinkBackwardIcon size={20} />
                </a>
            {/if}
            <span class="navbar-item pointer-events-none transition-[padding]" class:pl-0={back}>
                {$title ?? $t.name}
            </span>
        </div>
        <div
            class="navbar-center hidden md:flex"
            class:!hidden={!group}
            data-sveltekit-replacestate
        >
            {#each menu as Item}
                <a
                    href={Item.href}
                    class="navbar-item flex flex-row gap-1.5 items-center"
                    class:navbar-active={group === Item.group}
                    title={Item.title}
                >
                    <Item.Icon class="size-4 opacity-100 lg:opacity-75" />
                    <span class="hidden lg:block">{Item.title}</span>
                </a>
            {/each}
        </div>
        <div class="navbar-end w-max md:w-full">
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
                            {$connected ? $t.hint.status.connected : $t.hint.status.disconnected}
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
    <div class="px-4 pb-12 md:pl-6 pt-6 overflow-auto">
        {@render children?.()}
    </div>
    <div
        class="bg-gray-2 h-[60px] flex flex-row p-2.5 gap-1.5 md:hidden transition-[margin]"
        class:-mb-[60px]={!group}
        class:pointer-events-none={!group}
        data-sveltekit-replacestate
    >
        {#each menu as Item}
            <div class="flex-grow flex items-center justify-center">
                <a
                    href={Item.href}
                    class="menu-item p-2.5 aspect-square w-auto h-full flex items-center justify-center"
                    class:menu-active={group === Item.group}
                    class:text-opacity-80={group == Item.group}
                    class:text-opacity-40={group !== Item.group}
                    title={Item.title}
                >
                    <Item.Icon />
                </a>
            </div>
        {/each}
    </div>
</div>

<input class="modal-state" id="modal-update" type="checkbox" checked={$updateAvailable} />
<div class="modal">
    <label class="modal-overlay" for="modal-update"></label>
    <div class="modal-content flex flex-col gap-5">
        <label for="modal-update" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >✕</label
        >
        <h2 class="text-xl">{$t.hint.update.title}</h2>
        <span>{$t.hint.update.description}</span>
        <div class="flex gap-3">
            <button class="btn btn-primary btn-block" onclick={() => window.location.reload()}>
                {$t.actions.reload}
            </button>
            <label for="modal-update" class="btn btn-block btn-ghost">
                {$t.actions.cancel}
            </label>
        </div>
    </div>
</div>
