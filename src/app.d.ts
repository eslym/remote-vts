import type { Readable } from 'svelte/store';
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        interface PageData {
            title?: Readable<string>;
            group?: string;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
