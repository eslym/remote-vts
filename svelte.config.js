import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { execSync } from 'child_process';

let version = process.env.GITHUB_SHA;

if (!version) {
    try {
        version = execSync('git rev-parse HEAD').toString().trim();
    } catch (e) {}
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
        adapter: adapter({
            fallback: '404.html'
        }),
        alias: {
            '$lang/*': 'lang/*'
        },
        version: {
            name: version
        },
        paths: {
            relative: false
        }
    }
};

export default config;
