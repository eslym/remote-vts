import { endpoint } from '$lib/config';
import { derived, get, writable } from 'svelte/store';
import { ApiClient } from 'vtubestudio';

let _client: ApiClient;
let _url: string = '';

export const connected = writable(false);

function onConnect() {
    connected.set(true);
}

function onDisconnect() {
    connected.set(false);
}

export const client = derived(endpoint, ($endpoint) => {
    if (import.meta.env.SSR) return undefined as any as ApiClient;
    if (_url === $endpoint) return _client!;
    if (_client) {
        _client.off('connect', onConnect);
        _client.off('disconnect', onDisconnect);
        _client.disconnect();
    }
    connected.set(false);
    _url = $endpoint;
    _client = new ApiClient({
        pluginName: 'Remote VTS',
        url: _url,
        pluginDeveloper: '0nepeop1e',
        authTokenGetter() {
            return localStorage.getItem('authToken');
        },
        async authTokenSetter(token) {
            localStorage.setItem('authToken', token);
        }
    });
    _client.on('connect', onConnect);
    _client.on('disconnect', onDisconnect);
    return _client;
});

if (!import.meta.env.SSR) {
    client.subscribe(() => {});
}
