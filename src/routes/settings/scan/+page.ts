import type { TranslationKeys } from '$lang';

export function load() {
    return {
        title: 'page.scan' satisfies TranslationKeys,
        back: '/settings'
    };
}
