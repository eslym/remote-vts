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
                    'sans-serif'
                ],
                mono: [
                    '"Noto Sans Mono"',
                    '"Noto Sans SC"',
                    '"Noto Sans TC"',
                    '"Noto Sans JP"',
                    '"Noto Sans KR"',
                    '"Twemoji"',
                    'monospace'
                ],
                emoji: ['"Noto Emoji"']
            }
        }
    },

    plugins: [rippleui as any, scrollbar]
} as Config;
