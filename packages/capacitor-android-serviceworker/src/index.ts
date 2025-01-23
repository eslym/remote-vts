import { registerPlugin } from '@capacitor/core';

import type { CapacitorServiceWorkerPlugin } from './definitions';

const CapacitorServiceWorker = registerPlugin<CapacitorServiceWorkerPlugin>('CapacitorServiceWorker', {
  web: () => import('./web').then((m) => new m.CapacitorServiceWorkerWeb()),
});

export * from './definitions';
export { CapacitorServiceWorker };
