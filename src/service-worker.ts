/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { build, files, prerendered, version } from '$service-worker';

const FALLBACK = '/404.html';

const UNCACHEABLE = new Set(['/lib/version.json', '/lib/env.js']);

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
const ASSETS = [
    ...build, // the app itself
    ...files, // everything in `static`
    ...prerendered,
    ...(import.meta.env.DEV ? [] : [FALLBACK]) // the fallback page
];

const sw = self as ServiceWorkerGlobalScope & typeof globalThis;

sw.addEventListener('install', (event: ExtendableEvent) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        const previousCache = await caches
            .keys()
            .then((keys) => keys.find((key) => key !== CACHE && key.startsWith('cache-')));
        const oldFiles = new Set<string>();
        if (previousCache) {
            const oldCache = await caches.open(previousCache);
            for (const path of ASSETS) {
                if (!path.startsWith('/lib/immutable/')) continue;
                const response = await oldCache.match(path);
                if (!response) continue;
                cache.put(path, response);
                oldFiles.add(path);
            }
        }
        await cache.addAll(
            ASSETS.filter((p) => !oldFiles.has(p)).map((u) => {
                return new Request(u, {
                    cache: u.startsWith('/lib/immutable/') ? 'default' : 'reload'
                });
            })
        );
    }

    event.waitUntil(Promise.all([withRetry(addFilesToCache), sw.skipWaiting()]));
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event: FetchEvent) => {
    // ignore POST requests etc
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== location.origin) return;

    if (ASSETS.includes(url.pathname)) {
        event.respondWith(respond(url.pathname));
    } else if (!import.meta.env.DEV && !UNCACHEABLE.has(url.pathname)) {
        event.respondWith(respond(FALLBACK));
    }
});

async function respond(pathname: string) {
    const cache = await caches.open(CACHE);
    return cache.match(pathname) as Promise<Response>;
}

async function withRetry(fn: () => Promise<void>) {
    let attempts = 0;
    while (true) {
        try {
            await fn();
            break;
        } catch (err) {
            await sleep(5000 * 2 ** attempts);
            attempts++;
            if (attempts > 5) throw err;
        }
    }
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
