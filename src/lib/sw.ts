import '$lib/polyfill';
import { writable } from 'svelte/store';

export const updateAvailable = writable(false);
export const swReady = writable(false);

const sw_url = '/service-worker.js';

if (!import.meta.env.SSR) {
    if ('navigator' in globalThis) {
        (async () => {
            const old_reg = await navigator.serviceWorker.getRegistration(sw_url);
            swReady.set(Boolean(old_reg));
            const reg = await navigator.serviceWorker.register(sw_url, {
                type: import.meta.env.DEV ? 'module' : 'classic'
            });
            reg.addEventListener('updatefound', () => {
                const worker = reg.installing!;
                worker.addEventListener('statechange', () => {
                    switch (worker.state) {
                        case 'installed':
                            swReady.set(true);
                            if (navigator.serviceWorker.controller) {
                                // new update available
                                updateAvailable.set(true);
                            } else {
                                // first install
                                updateAvailable.set(false);
                            }
                            break;
                    }
                });
            });
        })();
    } else {
        swReady.set(true);
    }
}
