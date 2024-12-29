import type { TranslationKeys } from '$lang';

export const prerender = true;

export function load() {
    return {
        title: 'privacy.title' satisfies TranslationKeys,
        back: '/settings'
    };
}
