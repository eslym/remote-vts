import { createSubscriber } from 'svelte/reactivity';
import { get, type Writable } from 'svelte/store';

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debug(...args: any[]): void {
    if (import.meta.env.DEV) {
        console.log(...args);
    }
}

export function wrapReactive<T>(value: T): PropertyDescriptor {
    let notifier: (() => void) | undefined;
    const subscribe = createSubscriber((update) => {
        notifier = update;
        return () => {
            notifier = undefined;
        };
    });

    return {
        get() {
            subscribe();
            return value;
        },
        set(newValue: T) {
            value = newValue;
            if (notifier) notifier();
        }
    };
}

export function wrapWritable<T>(source: Writable<T>): PropertyDescriptor {
    const subscribe = createSubscriber((update) => {
        return source.subscribe(() => update());
    });

    return {
        get() {
            subscribe();
            return get(source);
        },
        set(newValue: T) {
            source.set(newValue);
        }
    };
}

export const validURL =
    'canParse' in URL
        ? URL.canParse.bind(URL)
        : function (url: string | URL, base?: string | URL) {
              try {
                  new URL(url, base);
                  return true;
              } catch {
                  return false;
              }
          };

export const withResolvers: typeof Promise.withResolvers =
    'withResolvers' in Promise
        ? (Promise.withResolvers.bind(Promise) as any)
        : function () {
              let resolve!: (value?: unknown) => void;
              let reject!: (reason?: unknown) => void;
              const promise = new Promise((res, rej) => {
                  resolve = res;
                  reject = rej;
              });
              return { promise, resolve, reject };
          };
