import { registerPlugin } from '@capacitor/core';

import type { NetworkInterfacePlugin } from './definitions';

const NetworkInterface = registerPlugin<NetworkInterfacePlugin>('NetworkInterface', {
  web: () => import('./web').then((m) => new m.NetworkInterfaceWeb()),
});

export * from './definitions';
export { NetworkInterface };
