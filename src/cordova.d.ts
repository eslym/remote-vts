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

declare namespace cordova {
    export namespace InAppBrowser {
        interface InAppBrowserEvent<
            T extends 'loadstart' | 'loadstop' | 'loaderror' | 'exit' | 'message'
        > {
            type: T;
            url: string;
            message: T extends 'loaderror' ? string : never;
            code: T extends 'loaderror' ? number : never;
            data: T extends 'message' ? string : never;
        }

        interface InAppBrowserRef {
            addEventListener<T extends 'loadstart' | 'loadstop' | 'loaderror' | 'exit' | 'message'>(
                event: T,
                callback: (event: InAppBrowserEvent<T>) => void
            ): void;
            removeEventListener(event: string, callback: (event: any) => void): void;
            close(): void;
            show(): void;
            hide(): void;
            executeScript(details: { code: string }): void;
            insertCSS(details: { code: string }): void;
        }

        export function open(url: string, target: string, options: string): InAppBrowserRef;
    }

    export namespace plugin {
        export namespace http {
            interface HttpResponse {
                status: number;
                url: string;
                data: string;
                headers: Record<string, string>;
            }

            export function sendRequest(
                url: string,
                options: {
                    method: 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch';
                    data?: string;
                    headers?: Record<string, string>;
                    timeout?: number;
                },
                success: (response: HttpResponse) => void,
                failure: (response: HttpResponse) => void
            ): void;
            export function setRequestTimeout(timeout: number): void;
            export function setConnectTimeout(timeout: number): void;
            export function setReadTimeout(timeout: number): void;

            export function setHeader(name: string, value: string): void;
            export function setHeader(host: string, name: string, value: string): void;
        }
    }

    export namespace plugins {
        export namespace browsertab {
            export function openUrl(
                url: string,
                success?: () => void,
                error?: (err: any) => void
            ): void;
            export function isAvailable(
                success: (result: boolean) => void,
                error?: (err: any) => void
            ): void;
        }
    }

    export function exec(
        success: (result: any) => void,
        failure: (error: any) => void,
        service: string,
        action: string,
        args: any[]
    ): void;
}

declare namespace networkinterface {
    export function getWiFiIPAddress(
        callback: (ip: { ip: string; subnet: string }) => void,
        errorCallback: (err: any) => void
    ): void;
    export function getCarrierIPAddress(
        callback: (ip: { ip: string; subnet: string }) => void,
        errorCallback: (err: any) => void
    ): void;
}

declare namespace StatusBar {
    export function styleDefault(): void;
    export function styleLightContent(): void;
    export function styleBlackTranslucent(): void;
    export function styleBlackOpaque(): void;
    export function backgroundColorByName(color: string): void;
    export function backgroundColorByHexString(color: string): void;
    export function hide(): void;
    export function show(): void;
}

declare namespace NavigationBar {
    export function backgroundColorByName(color: string, light?: boolean): void;
    export function backgroundColorByHexString(color: string, light?: boolean): void;
    export function hide(): void;
    export function show(): void;
}
