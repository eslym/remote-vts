<script lang="ts">
    import { client, connected } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import {
        currentModel,
        hotkeys,
        hotkeyConfigs,
        type VTSHotkey,
        type CustomConfig
    } from '$lib/config';
    import Button from '$lib/coms/Button.svelte';

    let configs = $derived($currentModel ? hotkeyConfigs[$currentModel] : {});
    let displayHotkeys = $derived(calculateOrder($currentModel ? $hotkeys : [], configs));

    function calculateOrder(hotkeys: VTSHotkey[], configs: Record<string, CustomConfig>) {
        return hotkeys.sort((a, b) => {
            const aindex = configs[a.hotkeyID].index;
            const bindex = configs[b.hotkeyID].index;
            if (aindex !== null && bindex !== null) {
                return aindex - bindex;
            }
            if (aindex !== null) {
                return -1;
            }
            if (bindex !== null) {
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
    }
</script>

<Connection>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {#each displayHotkeys as hotkey (hotkey.hotkeyID)}
            {@const cfg = configs[hotkey.hotkeyID]}
            {#if !cfg.hidden}
                <Button
                    icon={cfg.icon}
                    label={cfg.displayName || hotkey.name || hotkey.description}
                    active={hotkey.hotkeyID === $currentModel}
                    onclick={() => $client.hotkeyTrigger({ hotkeyID: hotkey.hotkeyID })}
                    disabled={!$connected}
                />
            {/if}
        {/each}
    </div>
</Connection>
