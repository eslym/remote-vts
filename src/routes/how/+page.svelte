<script lang="ts" module>
    let tab = $state('connect');
</script>

<script lang="ts">
    import Cordova from '$lib/coms/Cordova.svelte';
    import { Locale, t } from '$lib/lang';
    import { Tick04Icon, Move02Icon, ViewOffSlashIcon, SearchVisualIcon } from 'hugeicons-svelte';

    // TODO: complete this page
</script>

{#snippet bold(text: string)}
    <strong class="font-semibold">{text}</strong>
{/snippet}

{#snippet code(text: string)}
    <code class="font-mono px-2 py-0.5 bg-gray-4 rounded">{text}</code>
{/snippet}

{#snippet local_ip(text: string)}
    <a
        href="https://support.microsoft.com/en-us/windows/find-your-ip-address-in-windows-f21a9bbc-c582-55cd-35e0-73431160a1b9"
        target="_blank"
        class="link link-secondary"
    >
        {text}
    </a>
{/snippet}

{#snippet scan_button()}
    <SearchVisualIcon size={20} class="text-purple-10 inline-block mx-0.5" />
{/snippet}

{#snippet ok_button()}
    <Tick04Icon size={20} class="text-green-10 inline-block mx-0.5" />
{/snippet}

{#snippet drag_button()}
    <Move02Icon size={20} class="text-gray-10 inline-block mx-0.5" />
{/snippet}

{#snippet hide_button()}
    <ViewOffSlashIcon size={20} class="text-purple-10 inline-block mx-0.5" />
{/snippet}

<div class="accordion-group">
    <div class="accordion outline-none">
        <input
            type="radio"
            bind:group={tab}
            value="connect"
            id="how-connect"
            class="accordion-toggle"
        />
        <label for="how-connect" class="accordion-title">{t.how.connect.title}</label>
        <div class="accordion-content px-4">
            <div class="min-h-0">
                <ol class="list-decimal list-outside ml-6">
                    <li class="my-1.5">{t.how.connect.network}</li>
                    <li class="my-1.5">
                        {t.how.connect.endpoint.desciption}
                        <ul class="list-disc list-outside ml-6 mr-2 my-2.5">
                            <li class="my-1.5">
                                {@render Locale.snippets.how.connect.endpoint.manual({
                                    bold,
                                    code,
                                    local_ip
                                })}
                            </li>
                            <li class="my-1.5">
                                <Cordova>
                                    {@render Locale.snippets.how.connect.endpoint.scan({
                                        bold,
                                        scan_button
                                    })}
                                    {#snippet notAvailable()}
                                        {@render Locale.snippets.how.connect.endpoint.wss({
                                            code,
                                            bold
                                        })}
                                    {/snippet}
                                </Cordova>
                            </li>
                        </ul>
                    </li>
                    <li class="my-1.5">{t.how.connect.authenticate}</li>
                </ol>
            </div>
        </div>
    </div>
    <div class="accordion outline-none">
        <input
            type="radio"
            bind:group={tab}
            value="customize"
            id="how-customize"
            class="accordion-toggle"
        />
        <label for="how-customize" class="accordion-title">{t.how.customize.title}</label>
        <div class="accordion-content px-4">
            <div class="min-h-0">
                <ul class="list-disc list-outside ml-6">
                    <li class="my-1.5">{t.how.customize.edit_mode}</li>
                    <li class="my-1.5">
                        {@render Locale.snippets.how.customize.drag({ drag_button })}
                    </li>
                    <li class="my-1.5">
                        {@render Locale.snippets.how.customize.hide({ hide_button })}
                    </li>
                    <li class="my-1.5">
                        {@render Locale.snippets.how.customize.done({ ok_button })}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
