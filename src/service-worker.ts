/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { build, files, prerendered, version } from '$service-worker';

const FALLBACK = '/404.html';

const UNCACHEABLE = new Set(['/_app/version.json', '/_app/env.js']);

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
const ASSETS = [
    ...build, // the app itself
    ...files, // everything in `static`
    ...prerendered,
    FALLBACK // the fallback page
];

const sw = self as ServiceWorkerGlobalScope & typeof globalThis;

sw.addEventListener('install', (event: ExtendableEvent) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS.map((u) => new Request(u)));
    }

    event.waitUntil(Promise.all([addFilesToCache(), sw.skipWaiting()]));
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
