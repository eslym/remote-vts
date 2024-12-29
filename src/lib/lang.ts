import { availableLangs, Localize, type AvailableLang } from '$lang';
import local from '@eslym/svelte-utility-stores/local';
import { derived, writable, type Writable } from 'svelte/store';

const fallbacks: Record<string, string> = {
    en: 'en',
    zh: 'zh-CN',
    'zh-HK': 'zh-TW'
};

function determineLang(lang: string): AvailableLang {
    if (availableLangs.includes(lang as any)) {
        return lang as any;
    }
    if (lang in fallbacks) {
        return fallbacks[lang] as any;
    }
    return (fallbacks[lang.split('-')[0]] as any) || 'en';
}

export const Locale = new Localize();

const _lang = local('lang');

const _temp = writable(Date.now());
const _getLang = derived([_lang, _temp], ([$lang]) => {
    return determineLang($lang ?? (import.meta.env.SSR ? 'en' : navigator.language));
});

export const lang = Object.assign(
    function (lang: AvailableLang) {
        const l = new Localize();
        l.lang = lang;
        return l.translations;
    },
    {
        ..._lang,
        subscribe: _getLang.subscribe
    } as Writable<AvailableLang>
);

export const t = Locale.translations;

if (!import.meta.env.SSR) {
    Locale.lang = determineLang(_lang.get() ?? navigator.language);
    Locale.tryLangs((l) => {
        return [l as AvailableLang];
    });
    _lang.subscribe((value) => {
        if (value === localStorage.getItem('lang')) return;
        if (value === null) {
            localStorage.removeItem('lang');
        } else {
            localStorage.setItem('lang', value);
        }
        Locale.lang = determineLang(_lang.get() ?? navigator.language);
    });
    _getLang.subscribe(($t) => {
        Locale.lang = $t;
        document.documentElement.lang = Locale.translations.code;
    });
    window.addEventListener('languagechange', () => {
        _temp.set(Date.now());
    });
}
