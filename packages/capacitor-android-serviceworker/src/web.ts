import { WebPlugin } from '@capacitor/core';

import type { CapacitorServiceWorkerPlugin } from './definitions';

export class CapacitorServiceWorkerWeb extends WebPlugin implements CapacitorServiceWorkerPlugin {}
