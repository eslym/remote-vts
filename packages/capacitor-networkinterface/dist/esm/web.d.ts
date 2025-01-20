import { WebPlugin } from '@capacitor/core';
import type { NetworkInterfacePlugin } from './definitions';
export declare class NetworkInterfaceWeb extends WebPlugin implements NetworkInterfacePlugin {
    getWiFiIPAddress(): Promise<{
        ip: string;
        mask: number;
    }>;
}
