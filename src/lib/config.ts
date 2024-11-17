import { writable, derived, type Writable } from 'svelte/store';

const endpoint_base = writable(import.meta.env.SSR ? null : localStorage.getItem('endpoint'));
const endpoint_reader = derived(endpoint_base, ($endpoint) => {
    return $endpoint ?? 'ws://127.0.0.1:8001';
});

export const endpoint = {
    ...endpoint_base,
    subscribe: endpoint_reader.subscribe
} as Writable<string>;

if (!import.meta.env.SSR) {
    endpoint.subscribe((value) => {
        if (value === localStorage.getItem('endpoint')) return;
        localStorage.setItem('endpoint', value);
    });
    window.addEventListener('storage', (event) => {
        if (event.key === 'endpoint') {
            endpoint_base.set(event.newValue);
        }
    });
}
