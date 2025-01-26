<script lang="ts" module>
    let extra_links = $derived(
        [
            PUBLIC_REPO_URL
                ? {
                      title: t.settings.source_code,
                      url: PUBLIC_REPO_URL
                  }
                : undefined,
            PUBLIC_CONTACT_URL
                ? {
                      title: t.settings.feedback,
                      url: PUBLIC_CONTACT_URL
                  }
                : undefined,
            PUBLIC_SPONSOR_URL
                ? {
                      title: t.settings.sponsor,
                      url: PUBLIC_SPONSOR_URL
                  }
                : undefined
        ].filter(Boolean) as { title: string; url: string }[]
    );
</script>

<script lang="ts">
    import { Alert01Icon, FloppyDiskIcon, SearchVisualIcon } from '@eslym/hugeicons-svelte';
    import { endpoint, history } from '$lib/config';
    import { lang, t, Locale } from '$lib/lang';
    import { theme } from '$lib/theme';
    import { canGoBack } from '$lib/state';
    import { PUBLIC_CONTACT_URL, PUBLIC_REPO_URL, PUBLIC_SPONSOR_URL } from '$env/static/public';
    import { connectionState } from '$lib/client';
    import { availableLangs } from '$lang';
    import { validURL } from '$lib/utils';
    import { blur } from 'svelte/transition';
    import { Capacitor } from '@capacitor/core';

    let ep = $state($endpoint);

    let unChanged = $derived(ep === $endpoint);

    let invalid = $derived(invalidWebsocket(ep));

    function invalidWebsocket(url: string) {
        if (!validURL(url)) return true;
        const u = new URL(url);
        return u.protocol !== 'ws:' && u.protocol !== 'wss:';
    }
</script>

{#snippet vts_doc(title: string)}
    <a
        href="https://github.com/DenchiSoft/VTubeStudio/wiki/Plugins#how-to-use-plugins"
        target="_blank"
        class="link link-secondary text-sm"
    >
        {title}
    </a>
{/snippet}

{#snippet code(text: string)}
    <code class="font-mono">{text}</code>
{/snippet}

<div class="form-group mx-auto max-w-sm min-h-full">
    <div class="form-field">
        <label for="lang" class="form-label">{t.settings.lang}</label>
        <div class="popover w-full">
            <button
                id="lang"
                class="select select-solid select-block text-left popover-trigger !block"
            >
                <span class="mr-2">{lang($lang).icon}</span>
                {lang($lang).lang}
            </button>
            <div class="popover-content popover-bottom-left top-12">
                <div class="popover-arrow"></div>
                <div class="menu">
                    {#each availableLangs as l}
                        <button
                            class="menu-item"
                            class:menu-active={$lang === l}
                            onclick={(ev) => {
                                $lang = l;
                                ev.currentTarget.blur();
                            }}
                        >
                            <span class="mr-2">{lang(l).icon}</span>
                            {lang(l).lang}
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    </div>
    <div class="form-field mb-2">
        <span class="form-label">{t.settings.theme}</span>
        <div class="flex flex-row gap-2 justify-start items-start flex-wrap">
            <label class="text-sm align-middle">
                <input
                    class="radio inline-flex mr-1"
                    type="radio"
                    value={null}
                    bind:group={$theme}
                />
                {t.settings.scheme.system}
            </label>
            <label class="text-sm align-middle">
                <input
                    class="radio inline-flex mr-1"
                    type="radio"
                    value="light"
                    bind:group={$theme}
                />
                {t.settings.scheme.light}
            </label>
            <label class="text-sm align-middle">
                <input
                    class="radio inline-flex mr-1"
                    type="radio"
                    value="dark"
                    bind:group={$theme}
                />
                {t.settings.scheme.dark}
            </label>
        </div>
    </div>
    <div class="form-field">
        <label for="endpoint" class="form-label">{t.settings.endpoint}</label>
        <form
            class="grid grid-cols-[1fr_auto] gap-2"
            onsubmit={(ev) => {
                ev.preventDefault();
                ep = ep.toLowerCase();
                $endpoint = ep;
                if (ep !== 'ws://127.0.0.1:8001' && !$history.includes(ep)) {
                    $history = [ep, ...$history];
                    if ($history.length > 20) {
                        $history = $history.slice(0, 10);
                    }
                }
            }}
        >
            <input
                id="endpoint"
                type="url"
                class="input input-solid input-block font-mono"
                class:input-solid-error={invalid}
                bind:value={ep}
                autocomplete="on"
                list="history"
            />
            <button
                class="btn btn-solid-primary btn-circle"
                title={t.actions.save}
                disabled={unChanged || invalid}
            >
                <FloppyDiskIcon class="w-5 h-5" />
            </button>
            <datalist id="history">
                {#each [...$history, 'ws://127.0.0.1:8001'].sort() as h}
                    <option value={h}></option>
                {/each}
            </datalist>
        </form>
        {#if Capacitor.isNativePlatform()}
            <a
                href="/settings/scan"
                onclick={canGoBack}
                class="btn btn-solid-secondary btn-block"
                data-sveltekit-replacestate
            >
                {t.actions.scan}
                <SearchVisualIcon class="size-5 ml-2" />
            </a>
        {/if}
        <p class="text-sm text-content2">
            {@render Locale.snippets.hint.settings.endpoint({ code, vts_doc })}
        </p>
    </div>
    {#if connectionState.wsFromHttps}
        <div class="alert alert-warning items-start" data-sveltekit-replacestate>
            <Alert01Icon size={35} class="text-warning min-w-max mt-2" />
            <div class="flex flex-col">
                <span>{t.hint.ws.title}</span>
                <span class="text-content2 text-sm text-justify">
                    {@render Locale.snippets.hint.ws.description({ code })}
                </span>
                <span class="text-content2 text-sm font-semibold mt-2">
                    {t.hint.ws.suggestions.title}
                </span>
                <ul class="list-disc list-outside text-content2 text-sm ml-4">
                    <li>{@render Locale.snippets.hint.ws.suggestions.http({ code })}</li>
                    <li>{t.hint.ws.suggestions.proxy}</li>
                    <li>{t.hint.ws.suggestions.portForwarding}</li>
                </ul>
            </div>
        </div>
    {:else if !connectionState.connected}
        <div class="alert alert-warning" data-sveltekit-replacestate>
            <Alert01Icon size={35} class="text-warning min-w-max" />
            <div class="flex flex-col">
                <span>{t.status.disconnected.title}</span>
                <span class="text-content2 text-sm text-justify">
                    {t.status.disconnected.description}
                </span>
            </div>
        </div>
    {:else if !connectionState.authenticated}
        <div class="alert alert-warning" data-sveltekit-replacestate>
            <Alert01Icon size={35} class="text-warning min-w-max" />
            <div class="flex flex-col">
                <span>{t.status.unauthenticated.title}</span>
                <span class="text-content2 text-sm text-justify">
                    {t.status.unauthenticated.description}
                </span>
            </div>
        </div>
    {/if}
    <div class="h-6"></div>
    <div class="form-field mt-auto">
        <a href="/how" class="btn" onclick={canGoBack} data-sveltekit-replacestate>
            {t.how.title}
        </a>
    </div>
    <div class="form-field">
        <a href="/privacy" class="btn" onclick={canGoBack} data-sveltekit-replacestate>
            {t.privacy.title}
        </a>
    </div>
    {#if extra_links.length}
        <div class="divider my-0"></div>
        {#each extra_links as link}
            <div class="form-field">
                <a href={link.url} target="_blank" class="btn">
                    {link.title}
                </a>
            </div>
        {/each}
    {/if}
</div>
