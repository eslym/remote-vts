import type { TranslationKeys } from '$lang';

export function load() {
    return {
        title: 'menu.settings' satisfies TranslationKeys,
        group: 'settings'
    };
}
