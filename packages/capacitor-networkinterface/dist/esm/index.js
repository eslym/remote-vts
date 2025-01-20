import { registerPlugin } from '@capacitor/core';
const NetworkInterface = registerPlugin('NetworkInterface', {
    web: () => import('./web').then((m) => new m.NetworkInterfaceWeb()),
});
export * from './definitions';
export { NetworkInterface };
//# sourceMappingURL=index.js.map