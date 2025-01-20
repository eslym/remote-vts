interface CapacitorWSEvents {
    message: {
        id: string;
        data: string;
    };
    open: {
        id: string;
    };
    close: {
        id: string;
        code: number;
        reason: string;
    };
    error: {
        id: string;
        message: string;
    };
}
export interface CapacitorWSPlugin {
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
    addListener<E extends keyof CapacitorWSEvents>(eventName: E, listenerFunc: (event: CapacitorWSEvents[E]) => void): void;
}
export {};
