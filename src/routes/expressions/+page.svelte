<script lang="ts">
    import { client, connected } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import {
        currentModel,
        expressions,
        expressionConfigs,
        type CustomConfig,
        type VTSExpression
    } from '$lib/config';
    import Button from '$lib/coms/Button.svelte';

    let configs = $derived($currentModel ? expressionConfigs[$currentModel] : {});
    let displayExpressions = $derived(calculateOrder($currentModel ? $expressions : [], configs));

    function calculateOrder(expressions: VTSExpression[], configs: Record<string, CustomConfig>) {
        return expressions.sort((a, b) => {
            const aindex = configs[a.file].index;
            const bindex = configs[b.file].index;
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
        {#each displayExpressions as expression (expression.file)}
            {@const cfg = configs[expression.file]}
            {#if !cfg.hidden}
                <Button
                    icon={cfg.icon}
                    label={cfg.displayName || expression.name || expression.file}
                    active={expression.active}
                    onclick={async () => {
                        await $client.expressionActivation({
                            expressionFile: expression.file,
                            active: !expression.active
                        });
                        $client
                            .expressionState({ details: true })
                            .then((e) => ($expressions = e.expressions));
                    }}
                    disabled={!$connected}
                />
            {/if}
        {/each}
    </div>
</Connection>
