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
                    '"Noto Sans SC"',
                    '"Noto Sans TC"',
                    '"Noto Sans JP"',
                    '"Noto Sans KR"',
                    '"Twemoji"',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                    "'Apple Color Emoji'",
                    "'Segoe UI Emoji'",
                    "'Segoe UI Symbol'",
                    "'Noto Color Emoji'"
                ],
                mono: [
                    '"Noto Sans Mono"',
                    '"Noto Sans SC"',
                    '"Noto Sans TC"',
                    '"Noto Sans JP"',
                    '"Noto Sans KR"',
                    '"Twemoji"',
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    "'Liberation Mono'",
                    "'Courier New'",
                    'monospace'
                ],
                emoji: ['"Twemoji"']
            }
        }
    },

    plugins: [rippleui as any, scrollbar]
} as Config;
