import * as devalue from 'devalue';
import { storeWith } from '@eslym/svelte-utility-stores/stringify';
import { SvelteDate, SvelteMap, SvelteSet, createSubscriber } from 'svelte/reactivity';

const dvOptions = {
    Set: (...values: any[]) => new SvelteSet(values),
    Map: (...values: any[]) => {
        const map = new SvelteMap();
        for (let i = 0; i < values.length; i += 2) {
            map.set(values[i], values[i + 1]);
        }
        return map;
    },
    Date: (value: string) => new SvelteDate(value)
};

const dv = {
    stringify: devalue.stringify,
    parse(str: string) {
        return devalue.parse(str, dvOptions);
    }
};

export const deval = storeWith(dv);

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
        },
    };
}
