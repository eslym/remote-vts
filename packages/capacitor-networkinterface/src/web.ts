import { WebPlugin } from '@capacitor/core';

import type { NetworkInterfacePlugin } from './definitions';

export class NetworkInterfaceWeb extends WebPlugin implements NetworkInterfacePlugin {
  async getWiFiIPAddress(): Promise<{ ip: string; mask: number }> {
    throw new Error('Method not implemented.');
  }
}
