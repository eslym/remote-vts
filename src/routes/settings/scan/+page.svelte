<script lang="ts">
    import Cordova from '$lib/coms/Cordova.svelte';
    import EndpointScanner from '$lib/coms/EndpointScanner.svelte';
    import { t } from '$lib/lang';
    import { Alert01Icon } from 'hugeicons-svelte';
</script>

<div class="form-group mx-auto max-w-sm">
    <Cordova>
        {#snippet notAvailable()}
            <div class="alert alert-warning mb-12">
                <Alert01Icon size={35} class="text-warning min-w-max" />
                <div class="flex flex-col">
                    <span>{t.hint.scan.title}</span>
                    <span class="text-content2 text-sm text-justify">
                        {t.hint.scan.description}
                    </span>
                </div>
            </div>
        {/snippet}
        <EndpointScanner />
    </Cordova>
</div>
