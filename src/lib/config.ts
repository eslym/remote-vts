import { derived, type Writable } from 'svelte/store';
import local from '@eslym/svelte-utility-stores/local';
import json from '@eslym/svelte-utility-stores/json';
import type { ApiClient } from 'vtubestudio';

type VTSModel = Awaited<ReturnType<ApiClient['availableModels']>>['availableModels'][number];
type VTSHotkey = Awaited<
    ReturnType<ApiClient['hotkeysInCurrentModel']>
>['availableHotkeys'][number];
type VTSExpression = Awaited<ReturnType<ApiClient['expressionState']>>['expressions'][number];

const endpoint_base = local('vts-endpoint');
const endpoint_reader = derived(endpoint_base, ($endpoint) => {
    return $endpoint ?? 'ws://127.0.0.1:8001';
});

export const endpoint = {
    ...endpoint_base,
    subscribe: endpoint_reader.subscribe
} as Writable<string>;

export const history = json<string[]>(local('vts-endpoint-history'), () => []);

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

export const models = json<VTSModel[]>(local('vts-models'), () => []);

export const currentModel = local('vts-current-model');

export const hotkeys = json<VTSHotkey[]>(local('vts-hotkeys'), () => []);

export const expressions = json<VTSExpression[]>(local('vts-expressions'), () => []);
