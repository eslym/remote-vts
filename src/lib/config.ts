import { derived, type Writable } from 'svelte/store';
import local from '@eslym/svelte-utility-stores/local';
import json from '@eslym/svelte-utility-stores/json';
import type { ApiClient } from 'vtubestudio';
import { wrapWritable } from './utils';

export type VTSModel = Awaited<ReturnType<ApiClient['availableModels']>>['availableModels'][number];
export type VTSHotkey = Awaited<
    ReturnType<ApiClient['hotkeysInCurrentModel']>
>['availableHotkeys'][number];
export type VTSExpression = Awaited<
    ReturnType<ApiClient['expressionState']>
>['expressions'][number];

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

const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

function bigintToBase62(n: bigint) {
    let result = '';
    while (n > 0n) {
        result = B62[Number(n % 62n)] + result;
        n = n / 62n;
    }
    return result;
}

function hexToBase62(hex: string) {
    return bigintToBase62(BigInt(`0x${hex}`));
}

function stringToBase62(str: string) {
    const bytes = new TextEncoder().encode(str);
    let n = 0n;
    for (const byte of bytes) {
        n = (n << 8n) | BigInt(byte);
    }
    return bigintToBase62(n);
}

class CustomConfig implements Config {
    icon!: string | null;
    displayName!: string | null;
    index!: number | null;
    hidden!: boolean;

    constructor(prefix: string, ...keys: string[]) {
        const baseHidden = local(`vts-${prefix}-${keys.join('-')}-hidden`);
        const hidden = derived(baseHidden, ($hidden) => typeof $hidden === 'string');
        function setHidden(value: boolean) {
            if (!value) localStorage.removeItem(baseHidden.key);
            baseHidden.set(value ? '' : null);
        }

        const baseIndex = local(`vts-${prefix}-${keys.join('-')}-index`);
        const index = derived(baseIndex, ($index) => Number($index));
        function setIndex(value: number | null) {
            if (value === null) localStorage.removeItem(baseIndex.key);
            if (baseHidden.get() === null) localStorage.removeItem(baseIndex.key);
            baseIndex.set(`${value}`);
        }

        Object.defineProperties(this, {
            icon: wrapWritable(local(`vts-${prefix}-${keys.join('-')}-icon`)),
            displayName: wrapWritable(local(`vts-${prefix}-${keys.join('-')}-display-name`)),
            index: wrapWritable({
                subscribe: index.subscribe,
                set: setIndex,
                update(updater) {
                    setIndex(updater(Number(baseIndex.get())));
                }
            } satisfies Writable<number | null>),
            hidden: wrapWritable({
                subscribe: hidden.subscribe,
                set: setHidden,
                update(updater) {
                    setHidden(updater(Boolean(baseHidden.get())));
                }
            } satisfies Writable<boolean>)
        });
    }
}

interface Config {
    icon: string | null;
    displayName: string | null;
    index: number | null;
    hidden: boolean;
}

export type { Config as CustomConfig };

const configInstances = new Map<string, CustomConfig>();

function getModelConfig(modelId: string) {
    const key = `model-${modelId}`;
    let config = configInstances.get(key);
    if (!config) {
        config = new CustomConfig('model', modelId);
        configInstances.set(key, config);
    }
    return config;
}

function getHotkeysConfig(modelId: string, hotkeyId: string) {
    const key = `hotkey-${modelId}-${hotkeyId}`;
    let config = configInstances.get(key);
    if (!config) {
        config = new CustomConfig('hotkey', modelId, hotkeyId);
        configInstances.set(key, config);
    }
    return config;
}

function getExpressionConfig(modelId: string, expressionId: string) {
    const key = `expr-${modelId}-${expressionId}`;
    let config = configInstances.get(key);
    if (!config) {
        config = new CustomConfig('expr', modelId, expressionId);
        configInstances.set(key, config);
    }
    return config;
}

function modelsProxy() {
    return new Proxy(
        {},
        {
            get(_, modelId: string) {
                if (typeof modelId !== 'string') return undefined;
                return getModelConfig(hexToBase62(modelId));
            }
        }
    );
}

function hotkeysProxy(modelId: string) {
    return new Proxy(
        {},
        {
            get(_, hotkeyId: string) {
                if (typeof hotkeyId !== 'string') return undefined;
                return getHotkeysConfig(hexToBase62(modelId), hexToBase62(hotkeyId));
            }
        }
    );
}

function modekHotkeysProxy() {
    return new Proxy(
        {},
        {
            get(_, modelId: string) {
                if (typeof modelId !== 'string') return undefined;
                return hotkeysProxy(modelId);
            }
        }
    );
}

function expressionsProxy(modelId: string) {
    return new Proxy(
        {},
        {
            get(_, expressionId: string) {
                if (typeof expressionId !== 'string') return undefined;
                return getExpressionConfig(hexToBase62(modelId), stringToBase62(expressionId));
            }
        }
    );
}

function modelExpressionsProxy() {
    return new Proxy(
        {},
        {
            get(_, modelId: string) {
                if (typeof modelId !== 'string') return undefined;
                return expressionsProxy(modelId);
            }
        }
    );
}

export const modelConfigs = modelsProxy() as Record<string, CustomConfig>;
export const hotkeyConfigs = modekHotkeysProxy() as Record<string, Record<string, CustomConfig>>;
export const expressionConfigs = modelExpressionsProxy() as Record<
    string,
    Record<string, CustomConfig>
>;
