import * as devalue from 'devalue';
import { storeWith } from '@eslym/svelte-utility-stores/stringify';
import { SvelteDate, SvelteMap, SvelteSet } from 'svelte/reactivity';

const dvOptions = {
    Set: (...values: any[]) => new SvelteSet(values),
    Map: (...values: [any, any][]) => new SvelteMap(values),
    Date: (value: string) => new SvelteDate(value)
};

const dv = {
    stringify: devalue.stringify,
    parse(str: string) {
        return devalue.parse(str, dvOptions);
    }
};

export const deval = storeWith(dv);
