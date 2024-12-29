import type { TranslationKeys } from '$lang';
import type { Readable } from 'svelte/store';
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        interface PageData {
            title?: TranslationKeys;
            group?: string;
            back?: string;
        }
        interface PageState {
            canGoBack?: boolean;
        }
        // interface Platform {}
    }
}

export {};
