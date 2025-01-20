import { registerPlugin } from '@capacitor/core';
const CapacitorWS = registerPlugin('CapacitorWS', {
    web: () => import('./web').then((m) => new m.CapacitorWSWeb()),
    ios: () => {
        throw new Error('Not implemented on iOS');
    },
});
export * from './definitions';
export { CapacitorWS };
//# sourceMappingURL=index.js.map