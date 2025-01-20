import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { InAppBrowser, DefaultSystemBrowserOptions } from '@capacitor/inappbrowser';
import type { IApiClientOptions } from 'vtubestudio';
import type { WebSocketReadyState } from 'vtubestudio/lib/ws';
import { CapacitorWS } from '@eslym/capacitor-websocket';
import { PUBLIC_CAPACITOR_UPDATE_URL } from '$env/static/public';
import { version } from '$app/environment';
import { LiveUpdate } from '@capawesome/capacitor-live-update';
import { updateAvailable } from '$lib/sw';

if (Capacitor.isNativePlatform()) {
    window.addEventListener('click', ((ev: MouseEvent & { target: HTMLAnchorElement }) => {
        if (ev.defaultPrevented) return;
        if (ev.button !== 0) return;
        if (ev.target.tagName !== 'A') return;
        const href = ev.target.getAttribute('href');
        if (!href) return;
        if (ev.target.origin === origin) return;
        ev.preventDefault();
        InAppBrowser.openInSystemBrowser({
            url: href,
            options: DefaultSystemBrowserOptions
        });
    }) as any);

    if (PUBLIC_CAPACITOR_UPDATE_URL) {
        LiveUpdate.getVersionName()
            .then(async ({ versionName }) => {
                const url = new URL(PUBLIC_CAPACITOR_UPDATE_URL);
                url.searchParams.set('platform', Capacitor.getPlatform());
                url.searchParams.set('version', versionName);
                const res = await CapacitorHttp.get({
                    url: url.href,
                    headers: {
                        Accept: 'application/json'
                    },
                    responseType: 'json'
                });

                if (res.status !== 200) return;
                if (res.data.name !== version) {
                    await LiveUpdate.downloadBundle({
                        url: res.data.url,
                        bundleId: res.data.name
                    });
                    await LiveUpdate.setNextBundle({
                        bundleId: res.data.name
                    });
                    updateAvailable.set(true);
                    return;
                }
                const { bundleIds } = await LiveUpdate.getBundles();
                for (const bundleId of bundleIds) {
                    if (bundleId !== version) {
                        await LiveUpdate.deleteBundle({ bundleId });
                    }
                }
            })
            .catch(() => {});
    }
}

const sockets = new Map<string, CapacitorWebsocket>();

CapacitorWS.addListener('open', (ev) => {
    const socket = sockets.get(ev.id);
    if (socket) {
        socket.readyState = 1;
        socket.dispatchEvent(new Event('open'));
    }
});

CapacitorWS.addListener('close', (ev) => {
    const socket = sockets.get(ev.id);
    if (socket) {
        socket.readyState = 3;
        socket.dispatchEvent(new CloseEvent('close', { code: ev.code, reason: ev.reason }));
        sockets.delete(ev.id);
    }
});

CapacitorWS.addListener('error', (ev) => {
    console.error('error', ev);
    const socket = sockets.get(ev.id);
    if (socket) {
        socket.readyState = 3;
        socket.dispatchEvent(new Event('error'));
        socket.dispatchEvent(new CloseEvent('close', { code: 1006, reason: 'Connection closed' }));
    }
});

CapacitorWS.addListener('message', (ev) => {
    const socket = sockets.get(ev.id);
    if (socket) {
        socket.dispatchEvent(new MessageEvent('message', { data: ev.data }));
    }
});

export class CapacitorWebsocket
    implements ReturnType<Exclude<IApiClientOptions['webSocketFactory'], undefined>>
{
    #id!: string;
    #target = new EventTarget();

    readyState: WebSocketReadyState;

    constructor(url: string) {
        this.readyState = 0;
        CapacitorWS.connect({ url }).then((id) => {
            this.#id = id.id;
            sockets.set(id.id, this);
        });
    }

    close(code?: number, reason?: string): void {
        console.trace('close');
        if (this.readyState !== 1) return;
        CapacitorWS.close({ id: this.#id, code, reason }).catch(() => {});
    }

    send(data: string): void {
        if (this.readyState !== 1) return;
        CapacitorWS.send({ id: this.#id, data }).catch(() => {});
    }

    addEventListener(type: unknown, handler: unknown): void {
        this.#target.addEventListener(type as any, handler as any);
    }

    dispatchEvent: EventTarget['dispatchEvent'] = this.#target.dispatchEvent.bind(this.#target);
}
