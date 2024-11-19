import type { Config } from 'tailwindcss';
import rippleui from 'rippleui';
import scrollbar from 'tailwind-scrollbar';

export default {
    content: ['./src/**/*.{html,js,svelte,ts}', './lang/*.json'],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '"Twemoji"',
                    '"Noto Sans"',
                    '"Noto Sans SC"',
                    '"Noto Sans TC"',
                    '"Noto Sans JP"',
                    '"Noto Sans KR"',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                    "'Apple Color Emoji'",
                    "'Segoe UI Emoji'",
                    "'Segoe UI Symbol'",
                    "'Noto Color Emoji'"
                ],
                mono: [
                    '"Twemoji"',
                    '"Noto Sans Mono"',
                    '"Noto Sans SC"',
                    '"Noto Sans TC"',
                    '"Noto Sans JP"',
                    '"Noto Sans KR"',
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    "'Liberation Mono'",
                    "'Courier New'",
                    'monospace'
                ],
                emoji: ['"Noto Emoji"']
            }
        }
    },

    plugins: [rippleui as any, scrollbar]
} as Config;
