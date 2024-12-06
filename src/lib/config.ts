import { derived, type Writable } from 'svelte/store';
import local from '@eslym/svelte-utility-stores/local';
import json from '@eslym/svelte-utility-stores/json';
import { deval } from '$lib/stores';

const endpoint_base = local('endpoint');
const endpoint_reader = derived(endpoint_base, ($endpoint) => {
    return $endpoint ?? 'ws://127.0.0.1:8001';
});

export const endpoint = {
    ...endpoint_base,
    subscribe: endpoint_reader.subscribe
} as Writable<string>;

export const history = json<string[]>(local('endpoint-history'), () => []);

history.update(($history) => {
    const $enpoint = endpoint_base.get();
    if ($enpoint && $enpoint !== 'ws://127.0.0.1:8001' && !$history.includes($enpoint)) {
        $history.unshift($enpoint);
        if ($history.length > 20) {
            $history.pop();
        }
    }
    return $history;
});
