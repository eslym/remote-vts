import { debug } from '$lib/utils';
import type { IApiClientOptions } from 'vtubestudio';
import type { WebSocketReadyState } from 'vtubestudio/lib/ws';

type IWebSocketLike = ReturnType<Exclude<IApiClientOptions['webSocketFactory'], undefined>>;

declare namespace CordovaWebsocketPlugin {
    export function wsConnect(
        options: {
            url: string;
            timeout?: number;
            pingInterval?: number;
            headers?: Record<string, string>;
        },
        onEvent: (
            event:
                | {
                      webSocketId: string;
                      callbackMethod: 'onMessage';
                      message: string;
                  }
                | {
                      webSocketId: string;
                      callbackMethod: 'onClose';
                      code: number;
                      reason: string;
                  }
        ) => void,
        onConnect: (event: { code: number; webSocketId: string }) => void,
        onError: (event: { code: number; webSocketId: string; exception: string }) => void
    ): void;
    export function wsSend(id: string, message: string): void;
    export function wsClose(id: string, code?: number, reason?: string): void;
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
                this.dispatchEvent(
                    new CloseEvent('close')
                );
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
