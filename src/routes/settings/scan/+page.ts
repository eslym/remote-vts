import { t } from '$lib/lang';
import { derived } from 'svelte/store';

export function load() {
    return {
        title: derived(t, ($t) => $t.page.scan),
        back: '/settings'
    };
}