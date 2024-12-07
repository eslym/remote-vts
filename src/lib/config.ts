import { derived, type Writable } from 'svelte/store';
import local from '@eslym/svelte-utility-stores/local';
import json from '@eslym/svelte-utility-stores/json';
import { deval } from '$lib/stores';
import type { ApiClient } from 'vtubestudio';
import { SvelteMap } from 'svelte/reactivity';

type VTSModel = Awaited<ReturnType<ApiClient['availableModels']>>['availableModels'][number];
type VTSHotkey = Awaited<
    ReturnType<ApiClient['hotkeysInCurrentModel']>
>['availableHotkeys'][number];
type VTSExpression = Awaited<ReturnType<ApiClient['expressionState']>>['expressions'][number];

type CustomConfig = { hidden?: boolean; name?: string; icon?: string; index?: number };

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
export const modelConfigs = deval<Map<string, CustomConfig>>(
    local('vts-model-config'),
    () => new SvelteMap()
);

export const hotkeys = json<VTSHotkey[]>(local('vts-hotkeys'), () => []);
export const hotkeyConfigs = deval<Map<string, CustomConfig>>(
    local('vts-hotkey-config'),
    () => new SvelteMap()
);

export const expressions = json<VTSExpression[]>(local('vts-expressions'), () => []);
export const expressionConfigs = deval<Map<string, CustomConfig>>(
    local('vts-expression-config'),
    () => new SvelteMap()
);
