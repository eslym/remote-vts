import '$lib/polyfill';
import { debug } from '$lib/utils';
import type { IApiClientOptions } from 'vtubestudio';
import type { WebSocketReadyState } from 'vtubestudio/lib/ws';

type IWebSocketLike = ReturnType<Exclude<IApiClientOptions['webSocketFactory'], undefined>>;

const { promise: cordovaAvailable, resolve: resolveCordova } = Promise.withResolvers<boolean>();

export { cordovaAvailable };

declare var _cordovaNative: any;

if ('_cordovaNative' in window && typeof _cordovaNative.exec === 'function') {
    document.addEventListener(
        'deviceready',
        () => {
            resolveCordova(true);
            cordova.plugin.http.setHeader('User-Agent', 'Remote VTS (Cordova)');
            cordova.plugin.http.setConnectTimeout(0.1);
            cordova.plugin.http.setReadTimeout(0.1);
            document.addEventListener('click', ((
                ev: MouseEvent & { target: HTMLAnchorElement }
            ) => {
                if (ev.button !== 0) return;
                if (ev.target.tagName !== 'A') return;
                const target = ev.target.getAttribute('target');
                if (target !== '_blank') return;
                const href = ev.target.getAttribute('href');
                if (!href) return;
                ev.preventDefault();
                const features = ev.target.getAttribute('data-inappbrowser-features') || 'zoom=no';
                cordova.InAppBrowser.open(href, '_blank', features);
            }) as any);
        },
        { once: true }
    );
    const script = document.createElement('script');
    script.src = 'https://localhost/cordova.js';
    document.head.appendChild(script);
} else {
    resolveCordova(false);
}

export class CordovaWebsocket implements IWebSocketLike {
    #readyState: WebSocketReadyState;
    #webSocketId: string = '';
    #eventTarget: EventTarget = document.createDocumentFragment();

    get readyState(): WebSocketReadyState {
        return this.#readyState;
    }

    constructor(url: string) {
        if (!('CordovaWebsocketPlugin' in globalThis)) {
            throw new Error('CordovaWebsocketPlugin not found');
        }
        this.#readyState = 0;
        debug(this);
        CordovaWebsocketPlugin.wsConnect(
            {
                url,
                timeout: 1000,
                pingInterval: 1000,
                headers: {
                    'user-agent': 'Remote VTS (Cordova)'
                }
            },
            (event) => {
                debug('recv', event);
                if (event.callbackMethod === 'onMessage') {
                    this.dispatchEvent(new MessageEvent('message', { data: event.message }));
                } else if (event.callbackMethod === 'onClose') {
                    this.#readyState = 3;
                    this.dispatchEvent(
                        new CloseEvent('close', { code: event.code, reason: event.reason })
                    );
                }
            },
            (event) => {
                debug('conn', event);
                this.#readyState = 1;
                this.#webSocketId = event.webSocketId;
                this.dispatchEvent(new Event('open'));
            },
            (event) => {
                debug('err', event);
                this.#readyState = 3;
                this.dispatchEvent(
                    new ErrorEvent('error', {
                        error: new Error(event.exception),
                        message: event.exception
                    })
                );
                this.dispatchEvent(new CloseEvent('close'));
            }
        );
    }

    send(data: string): void {
        if (this.#readyState !== 1) {
            throw new Error('WebSocket is not open');
        }
        CordovaWebsocketPlugin.wsSend(this.#webSocketId, data);
    }

    close(code?: number, reason?: string): void {
        if (this.#readyState === 3) {
            return;
        }
        this.#readyState = 3;
        CordovaWebsocketPlugin.wsClose(this.#webSocketId, code, reason);
    }

    dispatchEvent: EventTarget['dispatchEvent'] = this.#eventTarget.dispatchEvent.bind(
        this.#eventTarget
    );
    addEventListener: IWebSocketLike['addEventListener'] = this.#eventTarget.addEventListener.bind(
        this.#eventTarget
    ) as any;
}

export function cordovaHttpGet(
    url: string
): Promise<{ status: number; headers?: Record<string, string> }> {
    return new Promise((resolve) => {
        cordova.plugin.http.sendRequest(
            url,
            { method: 'get' },
            (response) => {
                resolve(response);
            },
            (error) => {
                resolve(error);
            }
        );
    });
}
