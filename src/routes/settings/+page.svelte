<script lang="ts">
    import '$lib/polyfill';
    import { Alert01Icon, FloppyDiskIcon, SearchVisualIcon } from 'hugeicons-svelte';
    import { endpoint, history } from '$lib/config';
    import { lang, t, languages } from '$lib/lang';
    import { wsFromHttps } from '$lib/client';
    import { theme } from '$lib/theme';
    import { canGoBack } from '$lib/state';
    import Cordova from '$lib/coms/Cordova.svelte';

    let ep = $state($endpoint);

    let unChanged = $derived(ep === $endpoint);

    let invalid = $derived(invalidWebsocket(ep));

    function invalidWebsocket(url: string) {
        if (!URL.canParse(url)) return true;
        const u = new URL(url);
        return u.protocol !== 'ws:' && u.protocol !== 'wss:';
    }
</script>

<div class="form-group mx-auto max-w-sm min-h-full">
    <div class="form-field">
        <label for="lang" class="form-label">{$t.settings.lang}</label>
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
                    {#each languages as l}
                        <button
                            class="menu-item"
                            class:menu-active={$lang === l}
                            onclick={() => (($lang as any) = l)}
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
        <span class="form-label">{$t.settings.theme}</span>
        <div class="flex flex-row gap-2 justify-start items-start flex-wrap">
            <label class="text-sm align-middle">
                <input
                    class="radio inline-flex mr-1"
                    type="radio"
                    value={null}
                    bind:group={$theme}
                />
                {$t.settings.scheme.system}
            </label>
            <label class="text-sm align-middle">
                <input
                    class="radio inline-flex mr-1"
                    type="radio"
                    value="light"
                    bind:group={$theme}
                />
                {$t.settings.scheme.light}
            </label>
            <label class="text-sm align-middle">
                <input
                    class="radio inline-flex mr-1"
                    type="radio"
                    value="dark"
                    bind:group={$theme}
                />
                {$t.settings.scheme.dark}
            </label>
        </div>
    </div>
    <div class="form-field">
        <label for="endpoint" class="form-label">{$t.settings.endpoint}</label>
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
                title={$t.actions.save}
                disabled={unChanged || invalid}
            >
                <FloppyDiskIcon class="w-5 h-5" />
            </button>
            <datalist id="history">
                {#each [...$history, 'ws://127.0.0.1:8001'].toSorted() as h}
                    <option value={h}></option>
                {/each}
            </datalist>
        </form>
        <Cordova>
            <a
                href="/settings/scan"
                onclick={canGoBack}
                class="btn btn-solid-secondary btn-block"
                data-sveltekit-replacestate
            >
                {$t.actions.scan}
                <SearchVisualIcon class="size-5 ml-2" />
            </a>
        </Cordova>
        <p class="text-sm text-content2">{@html $t.hint.settings.endpoint}</p>
    </div>
    {#if $wsFromHttps}
        <div class="alert alert-warning items-start" data-sveltekit-replacestate>
            <Alert01Icon size={35} class="text-warning min-w-max mt-2" />
            <div class="flex flex-col">
                <span>{$t.hint.ws.title}</span>
                <span class="text-content2 text-sm text-justify">
                    {@html $t.hint.ws.description}
                </span>
                <span class="text-content2 text-sm font-semibold mt-2">
                    {$t.hint.ws.suggestions.title}
                </span>
                <ul class="list-disc list-outside text-content2 text-sm ml-4">
                    <li>{@html $t.hint.ws.suggestions.http}</li>
                    <li>{@html $t.hint.ws.suggestions.proxy}</li>
                    <li>{@html $t.hint.ws.suggestions.portForwarding}</li>
                </ul>
            </div>
        </div>
    {/if}
    <div class="form-field mt-auto">
        <a href="/privacy" class="btn" onclick={canGoBack} data-sveltekit-replacestate>
            {$t.privacy.title}
        </a>
    </div>
</div>
