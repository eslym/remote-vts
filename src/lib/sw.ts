import { writable } from 'svelte/store';
import { Capacitor } from '@capacitor/core';

export const updateAvailable = writable(false);
export const swReady = writable(false);

if (!import.meta.env.SSR) {
    if ('navigator' in globalThis && 'serviceWorker' in navigator) {
        (async () => {
            const sw_url = new URL('/service-worker.js', window.location.href);
            if (Capacitor.isNativePlatform()) {
                sw_url.searchParams.set('fonts-only', '');
                swReady.set(true);
            } else {
                const old_reg = await navigator.serviceWorker.getRegistration(sw_url);
                swReady.set(Boolean(old_reg));
            }
            const reg = await navigator.serviceWorker.register(sw_url, {
                type: import.meta.env.DEV ? 'module' : 'classic'
            });
            if (Capacitor.isNativePlatform()) return;
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
