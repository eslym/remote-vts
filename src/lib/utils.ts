import { createSubscriber } from 'svelte/reactivity';

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
