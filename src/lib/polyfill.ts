if (!('withResolvers' in Promise)) {
    (Promise as any).withResolvers = function () {
        let resolve!: (value?: unknown) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

if (!('canParse' in URL)) {
    (URL as any).canParse = function (url: string | URL, base?: string | URL) {
        try {
            new URL(url, base);
            return true;
        } catch {
            return false;
        }
    };
}

if(!('toSorted' in Array.prototype)) {
    Object.defineProperty(Array.prototype, 'toSorted', {
        value: function <T>(this: T[], compareFn?: (a: T, b: T) => number) {
            return [...this].sort(compareFn);
        }
    });
}
