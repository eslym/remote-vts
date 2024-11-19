import type { Config } from 'tailwindcss';
import rippleui from 'rippleui';
import scrollbar from 'tailwind-scrollbar';

export default {
    content: ['./src/**/*.{html,js,svelte,ts}', './lang/*.json'],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '"Noto Sans"',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                    'Twemoji',
                    "'Apple Color Emoji'",
                    "'Segoe UI Emoji'",
                    "'Segoe UI Symbol'",
                    "'Noto Color Emoji'"
                ],
                mono: [
                    '"Noto Sans Mono"',
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    "'Liberation Mono'",
                    "'Courier New'",
                    '"Twemoji"',
                    'monospace'
                ],
                emoji: ['"Noto Emoji"']
            }
        }
    },

    plugins: [rippleui as any, scrollbar]
} as Config;
