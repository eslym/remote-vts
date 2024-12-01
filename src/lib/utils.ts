export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debug(...args: any[]): void {
    if (import.meta.env.DEV) {
        console.log(...args);
    }
}
