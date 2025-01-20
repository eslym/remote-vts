import { registerPlugin } from '@capacitor/core';

import type { CapacitorWSPlugin } from './definitions';

const CapacitorWS = registerPlugin<CapacitorWSPlugin>('CapacitorWS', {
  web: () => import('./web').then((m) => new m.CapacitorWSWeb()),
  ios: () => {
    throw new Error('Not implemented on iOS');
  },
});

export * from './definitions';
export { CapacitorWS };
