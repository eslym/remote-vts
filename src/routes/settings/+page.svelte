<script lang="ts">
    import { Alert01Icon, FloppyDiskIcon } from 'hugeicons-svelte';
    import { endpoint } from '$lib/config';
    import { lang, t, languages } from '$lib/lang';
    import { wsFromHttps } from '$lib/client';

    let ep = $state($endpoint);

    let unChanged = $derived(ep === $endpoint);

    let invalid = $derived(invalidWebsocket(ep));

    function invalidWebsocket(url: string) {
        if (!URL.canParse(url)) return true;
        const u = new URL(url);
        return u.protocol !== 'ws:' && u.protocol !== 'wss:';
    }
</script>

<div class="form-group mx-auto max-w-sm">
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
    <div class="form-field">
        <label for="endpoint" class="form-label">{$t.settings.endpoint}</label>
        <div class="grid grid-cols-[1fr_auto] gap-2">
            <input
                id="endpoint"
                type="url"
                class="input input-solid input-block font-mono"
                class:input-solid-error={invalid}
                bind:value={ep}
            />
            <button
                class="btn btn-solid-primary btn-circle"
                onclick={() => {
                    $endpoint = ep;
                }}
                title={$t.actions.save}
                disabled={unChanged || invalid}
            >
                <FloppyDiskIcon class="w-5 h-5" />
            </button>
        </div>
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
                <ul class="list-disc list-outside text-content2 text-sm">
                    <li>{@html $t.hint.ws.suggestions.http}</li>
                    <li>{@html $t.hint.ws.suggestions.proxy}</li>
                    <li>{@html $t.hint.ws.suggestions.portForwarding}</li>
                </ul>
            </div>
        </div>
    {/if}
</div>
