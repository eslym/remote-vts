import { currentModel, endpoint, expressions, hotkeys, models } from '$lib/config';
import { cordovaAvailable, CordovaWebsocket } from '$lib/cordova';
import { derived, writable } from 'svelte/store';
import { ApiClient, HotkeyType } from 'vtubestudio';

import type { IApiClientOptions } from 'vtubestudio';

const icon =
    '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';

type IWebSocketLike = ReturnType<Exclude<IApiClientOptions['webSocketFactory'], undefined>>;

let _client: ApiClient;
let _url: string = '';

export const connected = writable(false);
export const wsFromHttps = writable(false);

function onConnect() {
    connected.set(true);
    _client.availableModels().then((res) => {
        models.set(res.availableModels);
        for (const model of res.availableModels) {
            if (model.modelLoaded) {
                currentModel.set(model.modelID);
            }
        }
    });
    _client.hotkeysInCurrentModel({}).then((res) => {
        hotkeys.set(res.availableHotkeys);
    });
    _client.expressionState({ details: true }).then((e) => expressions.set(e.expressions));
    _client.events.modelLoaded.subscribe((ev) => {
        models.update(($models) => {
            for (const model of $models) {
                if ((model.modelLoaded = model.modelID === ev.modelID)) {
                    currentModel.set(model.modelID);
                }
            }
            return $models;
        });
        _client.hotkeysInCurrentModel({}).then((res) => {
            hotkeys.set(res.availableHotkeys);
        });
        _client.expressionState({ details: true }).then((e) => expressions.set(e.expressions));
    }, {});
    _client.events.hotkeyTriggered.subscribe((ev) => {
        if (ev.hotkeyAction !== HotkeyType.ToggleExpression) {
            return;
        }
        _client.expressionState({ details: true }).then((e) => expressions.set(e.expressions));
    }, {});
}

function onDisconnect() {
    connected.set(false);
}

let WebsocketClass: new (url: string) => IWebSocketLike = WebSocket;

function getPluginName() {
    if (import.meta.env.DEV) {
        return '_cordovaNative' in window ? 'Remote VTS (DEV)' : 'Remote VTS (Web DEV)';
    }
    return '_cordovaNative' in window ? 'Remote VTS' : 'Remote VTS (Web)';
}

const pluginName = getPluginName();

export const client = derived(endpoint, ($endpoint) => {
    if (import.meta.env.SSR) return undefined as any as ApiClient;
    if (_url === $endpoint) return _client!;
    if (_client) {
        _client.off('connect', onConnect);
        _client.off('disconnect', onDisconnect);
        _client.disconnect();
    }
    connected.set(false);
    wsFromHttps.set(false);
    try {
        _url = $endpoint;
        _client = new ApiClient({
            pluginName,
            url: _url,
            pluginDeveloper: '0nepeop1e',
            pluginIcon: icon,
            authTokenGetter() {
                return localStorage.getItem('vts-token');
            },
            async authTokenSetter(token) {
                localStorage.setItem('vts-token', token);
            },
            webSocketFactory(url) {
                return new WebsocketClass(url);
            }
        });
        _client.on('connect', onConnect);
        _client.on('disconnect', onDisconnect);
    } catch (e) {
        wsFromHttps.set(true);
        console.error(e);
    }
    return _client;
});

if (!import.meta.env.SSR) {
    async function load() {
        if (await cordovaAvailable) {
            WebsocketClass = CordovaWebsocket;
        }
        client.subscribe(() => {});
    }
    load();
}
