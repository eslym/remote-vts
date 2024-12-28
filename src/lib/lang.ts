import en from '$lang/en.json';
import chs from '$lang/zh-CN.json';
import cht from '$lang/zh-TW.json';
import { derived, writable, type Writable } from 'svelte/store';

const langs = {
    en,
    'zh-CN': chs,
    'zh-TW': cht
};

const fallbacks: Record<string, string> = {
    en: 'en',
    zh: 'zh-CN',
    'zh-HK': 'zh-TW'
};

function langProxy(lang: string, src: Record<string, any>) {
    const checks = new Set([lang, fallbacks[lang.split('-')[0]], 'en'].filter(Boolean));
    return new Proxy(src.en, {
        get(target, prop) {
            if (typeof target[prop] === 'object') {
                return langProxy(
                    lang,
                    Object.fromEntries(
                        Object.entries(src).map(([key, value]) => [key, value[prop] ?? {}])
                    )
                );
            }
            for (const check of checks) {
                if (check in src && prop in src[check]) {
                    return src[check][prop];
                }
            }
            return undefined;
        }
    });
}

function determineLang(lang: string): keyof typeof langs {
    if (lang in langs) {
        return lang as any;
    }
    if (lang in fallbacks) {
        return fallbacks[lang] as any;
    }
    return (fallbacks[lang.split('-')[0]] as any) || 'en';
}

const _lang = writable(import.meta.env.SSR ? null : localStorage.getItem('lang'));
const _temp = writable(Date.now());
const _getLang = derived([_lang, _temp], ([$lang]) => {
    return determineLang($lang ?? (import.meta.env.SSR ? 'en' : navigator.language));
});

export const lang = Object.assign(
    function (lang: string) {
        const l = determineLang(lang);
        return langProxy(l, langs) as typeof langs.en;
    },
    {
        ..._lang,
        subscribe: _getLang.subscribe
    } as Writable<keyof typeof langs>
);

export const t = derived(lang, ($lang) => langProxy($lang, langs) as typeof langs.en);

export const languages = Object.keys(langs);

if (!import.meta.env.SSR) {
    _lang.subscribe((value) => {
        if (value === localStorage.getItem('lang')) return;
        if (value === null) {
            localStorage.removeItem('lang');
        } else {
            localStorage.setItem('lang', value);
        }
    });
    t.subscribe(($t) => {
        document.documentElement.lang = $t.code;
    });
    window.addEventListener('languagechange', () => {
        _temp.set(Date.now());
    });
    window.addEventListener('storage', (event) => {
        if (event.key === 'lang') {
            _lang.set(event.newValue);
        }
    });
}
