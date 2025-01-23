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

const GOOGLE_FONTS = new Set(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']);

// Cache local assets in capacitor is very redundant,
// since capacitor already caches all assets in the app bundle.
// This is a workaround to only cache google fonts in capacitor.
const CACHE_FONTS_ONLY = location.search.includes('fonts-only');

const sw = self as ServiceWorkerGlobalScope & typeof globalThis;

sw.addEventListener('install', (event: ExtendableEvent) => {
    if (CACHE_FONTS_ONLY) return;
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        const previousCache = await caches
            .keys()
            .then((keys) => keys.find((key) => key !== CACHE && key.startsWith('cache-')));
        const oldCache = previousCache ? await caches.open(previousCache) : null;
        const toFetch: string[] = [];
        for (const path of ASSETS) {
            const hit = await cache.match(path);
            if (hit) continue;
            if (path.startsWith('/lib/immutable/') && oldCache) {
                const old = await oldCache.match(path);
                if (old) {
                    cache.put(path, old);
                    continue;
                }
            }
            toFetch.push(path);
        }
        let progress = ASSETS.length - toFetch.length;
        await Promise.all(
            toFetch.map(async (path) => {
                const res = await enqueue(
                    new Request(path, {
                        cache: path.startsWith('/lib/immutable/') ? 'default' : 'reload'
                    })
                );
                await cache.put(path, res);
                progress++;
            })
        );
    }

    event.waitUntil(Promise.all([withRetry(addFilesToCache), sw.skipWaiting()]));
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
    if (CACHE_FONTS_ONLY) return;
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (!key.startsWith('cache-')) continue;
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event: FetchEvent) => {
    // ignore POST requests etc
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    if (GOOGLE_FONTS.has(url.origin)) {
        if (event.request.destination === 'font')
            return event.respondWith(networkFirstRespond(url.href, 'google-fonts'));
        else return networkFirstRespond(url.href, 'google-fonts');
    }

    if (CACHE_FONTS_ONLY || url.origin !== location.origin) return;

    if (ASSETS.includes(url.pathname)) {
        event.respondWith(cacheFirstRespond(url.pathname));
    } else if (!import.meta.env.DEV && !UNCACHEABLE.has(url.pathname)) {
        event.respondWith(cacheFirstRespond(FALLBACK));
    }
});

async function cacheFirstRespond(pathname: string, cacheKey = CACHE) {
    const cache = await caches.open(cacheKey);
    let res = await cache.match(pathname);
    if (res) return res;
    res = await fetch(pathname);
    cache.put(pathname, res.clone());
    return res;
}

async function networkFirstRespond(pathname: string, cacheKey = CACHE) {
    const cache = await caches.open(cacheKey);
    try {
        const res = await fetch(pathname);
        if (res.ok) {
            cache.put(pathname, res.clone());
        }
        return res;
    } catch (err) {
        const res = await cache.match(pathname);
        if (res) return res;
        throw err;
    }
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

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const cacheQueue: { req: Request; resolve: (res: Response) => void; reject: (err: any) => void }[] =
    [];

function enqueue(req: Request) {
    let shouldRun = cacheQueue.length === 0;
    return new Promise<Response>((resolve, reject) => {
        cacheQueue.push({ req, resolve, reject });
        if (!shouldRun) return;
        runQueue();
        runQueue();
        runQueue();
        runQueue();
    });
}

async function runQueue() {
    if (cacheQueue.length === 0) return;
    const { req, resolve, reject } = cacheQueue.shift()!;
    try {
        const res = await fetch(req);
        if (res.ok || res.status === 404) {
            resolve(res);
        } else {
            reject(new Error(res.statusText));
        }
    } catch (err) {
        reject(err);
    } finally {
        await sleep(500);
    }
}
