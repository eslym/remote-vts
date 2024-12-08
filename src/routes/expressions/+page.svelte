<script lang="ts">
    import { client, connected } from '$lib/client';
    import Connection from '$lib/coms/Connected.svelte';
    import { currentModel, expressions } from '$lib/config';
</script>

<Connection>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
        {#each $expressions as exp (`${$currentModel}/${exp.file}`)}
            <button
                class="btn btn-lg flex-col gap-2 p-6 h-auto"
                class:btn-primary={exp.active}
                onclick={() => {
                    $client
                        .expressionActivation({ expressionFile: exp.file, active: !exp.active })
                        .then(() => {
                            $client
                                .expressionState({ details: true })
                                .then((e) => ($expressions = e.expressions));
                        });
                }}
                disabled={!$connected}
            >
                {exp.name}
            </button>
        {/each}
    </div>
</Connection>
