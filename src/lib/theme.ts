import { derived, writable } from 'svelte/store';
import { cordovaAvailable } from './cordova';

export const DARK_ACTION_BAR = '#161616';
export const LIGHT_ACTION_BAR = '#fcfcfc';

export const DARK_NAVIGATION_BAR = '#1c1c1c';
export const LIGHT_NAVIGATION_BAR = '#f8f8f8';

export const systemDark = writable(
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
        cordovaAvailable.then((available) => {
            if (!available) return;
            StatusBar.backgroundColorByHexString($scheme === 'dark' ? DARK_ACTION_BAR : LIGHT_ACTION_BAR);
            if($scheme === 'dark') {
                StatusBar.styleLightContent();
            } else {
                StatusBar.styleDefault();
            }
            NavigationBar.backgroundColorByHexString($scheme === 'dark' ? DARK_NAVIGATION_BAR : LIGHT_NAVIGATION_BAR, $scheme === 'light');
        });
    });
}
