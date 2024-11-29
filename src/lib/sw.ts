import { writable } from 'svelte/store';

export const updateAvailable = writable(false);

if (!import.meta.env.SSR) {
    if ('navigator' in globalThis) {
        const registration = globalThis.navigator.serviceWorker.register('/service-worker.js', {
            type: import.meta.env.DEV ? 'module' : 'classic'
        });

        registration.then((reg) => {
            reg.addEventListener('updatefound', () => {
                const worker = reg.installing!;
                worker.addEventListener('statechange', () => {
                    switch (worker.state) {
                        case 'installed':
                            if (globalThis.navigator.serviceWorker.controller) {
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
        });
    }
}
