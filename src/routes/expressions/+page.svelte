<script lang="ts">
    import { client } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import { onMount } from 'svelte';
    import { HotkeyType, type ApiClient } from 'vtubestudio';

    let states: Awaited<ReturnType<ApiClient['expressionState']>> = $state({
        modelID: '',
        expressions: []
    } as any);
    let promise: Promise<any> = $state(undefined as any);

    onMount(() => {
        promise = $client.expressionState({ details: true }).then((e) => (states = e));
        $client.events.modelLoaded.subscribe(() => {
            promise = $client.expressionState({ details: true }).then((e) => (states = e));
        }, {});
        $client.events.hotkeyTriggered.subscribe((data) => {
            if (
                data.hotkeyAction !== HotkeyType.ToggleExpression &&
                data.hotkeyAction !== HotkeyType.RemoveAllExpressions
            ) {
                return;
            }
            $client.expressionState({ details: true }).then((e) => (states = e));
        }, {});
        return () => {
            $client.events.modelLoaded.unsubscribe();
        };
    });
</script>

<Connection>
    {#await promise}
        <div class="spinner"></div>
    {:then _}
        <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {#each states.expressions as exp (`${states.modelID}/${exp.file}`)}
                <button
                    class="btn btn-lg flex-col gap-2 p-6 h-auto"
                    class:btn-primary={exp.active}
                    onclick={() => {
                        $client
                            .expressionActivation({ expressionFile: exp.file, active: !exp.active })
                            .then(() => {
                                $client
                                    .expressionState({ details: true })
                                    .then((e) => (states = e));
                            });
                    }}
                >
                    {exp.name}
                </button>
            {/each}
        </div>
    {/await}
</Connection>
