import { t } from '$lib/lang';
import { derived } from 'svelte/store';

export const prerender = true;

export function load() {
    return {
        title: derived(t, ($t) => $t.privacy.title),
        back: '/settings'
    };
}
