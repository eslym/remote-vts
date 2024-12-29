import type { TranslationKeys } from '$lang';

export function load() {
    return {
        title: 'how.title' satisfies TranslationKeys,
        back: '/settings'
    };
}
