import { derived, type Writable } from 'svelte/store';
import local from '@eslym/svelte-utility-stores/local';
import json from '@eslym/svelte-utility-stores/json';
import type { StorageStore } from '@eslym/svelte-utility-stores';
import type { ApiClient } from 'vtubestudio';
import { createSubscriber } from 'svelte/reactivity';

export type VTSModel = Awaited<ReturnType<ApiClient['availableModels']>>['availableModels'][number];
export type VTSHotkey = Awaited<
    ReturnType<ApiClient['hotkeysInCurrentModel']>
>['availableHotkeys'][number];
export type VTSExpression = Awaited<ReturnType<ApiClient['expressionState']>>['expressions'][number];

type Subscriber = ReturnType<typeof createSubscriber>;

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

const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

function hexToBase62(hex: string) {
    let n = BigInt('0x' + hex);
    let result = '';
    while (n > 0n) {
        result = B62[Number(n % 62n)] + result;
        n = n / 62n;
    }
    return result;
}

function base64toBase62(base64: string) {
    let n = 0n;
    for (let i = 0; i < base64.length; i++) {
        n = n * 64n + BigInt(B64.indexOf(base64[i]));
    }
    return hexToBase62(n.toString(16));
}

class CustomConfig {
    #prefix: string;
    #keys: string[];

    #icon: StorageStore;
    #displayName: StorageStore;
    #index: StorageStore;
    #hidden: StorageStore;

    #iconSubscriber: Subscriber;
    #displayNameSubscriber: Subscriber;
    #indexSubscriber: Subscriber;
    #hiddenSubscriber: Subscriber;

    get icon() {
        this.#iconSubscriber();
        return this.#icon.get();
    }

    set icon(value: string | null) {
        this.#icon.set(value || null);
    }

    get displayName() {
        this.#displayNameSubscriber();
        return this.#displayName.get();
    }

    set displayName(value: string | null) {
        this.#displayName.set(value || null);
    }

    get index() {
        this.#indexSubscriber();
        const val = this.#index.get();
        return val ? parseInt(val) : null;
    }

    set index(value: number | null) {
        this.#index.set(value === null ? null : value.toString());
    }

    get hidden() {
        this.#hiddenSubscriber();
        return this.#hidden.get() === 'true';
    }

    set hidden(value: boolean) {
        this.#hidden.set(value ? 'true' : null);
    }

    constructor(prefix: string, ...keys: string[]) {
        this.#prefix = prefix;
        this.#keys = keys;

        this.#icon = local(`vts-${prefix}-${keys.join('-')}-icon`);
        this.#displayName = local(`vts-${prefix}-${keys.join('-')}-display-name`);
        this.#index = local(`vts-${prefix}-${keys.join('-')}-index`);
        this.#hidden = local(`vts-${prefix}-${keys.join('-')}-hidden`);

        this.#iconSubscriber = createSubscriber(this.#icon.subscribe);
        this.#displayNameSubscriber = createSubscriber(this.#displayName.subscribe);
        this.#indexSubscriber = createSubscriber(this.#index.subscribe);
        this.#hiddenSubscriber = createSubscriber(this.#hidden.subscribe);
    }
}

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
                return getExpressionConfig(
                    hexToBase62(modelId),
                    base64toBase62(btoa(expressionId))
                );
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
