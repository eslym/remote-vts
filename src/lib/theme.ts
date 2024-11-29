import { derived, writable } from 'svelte/store';

const systemDark = writable(
    import.meta.env.SSR ? false : window.matchMedia('(prefers-color-scheme: dark)').matches
);

export const theme = writable<null | 'light' | 'dark'>(
    import.meta.env.SSR ? null : (localStorage.getItem('theme') as any)
);

export const scheme = derived([systemDark, theme], ([$dark, $theme]) => {
    if ($theme) return $theme;
    return $dark ? 'dark' : 'light';
});

if (!import.meta.env.SSR) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        systemDark.set(e.matches);
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            theme.set(e.newValue as any);
        }
    });

    theme.subscribe((value) => {
        if (value) {
            localStorage.setItem('theme', value);
        } else {
            localStorage.removeItem('theme');
        }
    });

    scheme.subscribe(($scheme) => {
        document.documentElement.dataset.theme = $scheme;
    });
}
