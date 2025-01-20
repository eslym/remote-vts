import { WebPlugin } from '@capacitor/core';
import type { CapacitorWSPlugin } from './definitions';
export declare class CapacitorWSWeb extends WebPlugin implements CapacitorWSPlugin {
    #private;
    connect(options: {
        url: string;
    }): Promise<{
        id: string;
    }>;
    send(options: {
        id: string;
        data: string;
    }): Promise<void>;
    close(options: {
        id: string;
        code?: number;
        reason?: string;
    }): Promise<void>;
}
