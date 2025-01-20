var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _websockets, _id;
import { WebPlugin } from '@capacitor/core';
export class CapacitorWSWeb extends WebPlugin {
    constructor() {
        super(...arguments);
        _websockets.set(this, new Map());
        _id.set(this, 0);
    }
    async connect(options) {
        var _a;
        const ws = new WebSocket(options.url);
        const id = (__classPrivateFieldSet(this, _id, (_a = +__classPrivateFieldGet(this, _id)) + 1), _a).toString();
        const self = this;
        ws.onclose = (ev) => {
            self.notifyListeners('close', { id, code: ev.code, reason: ev.reason });
            __classPrivateFieldGet(self, _websockets).delete(id);
        };
        ws.onerror = () => {
            self.notifyListeners('error', { id, message: '' });
            __classPrivateFieldGet(self, _websockets).delete(id);
        };
        ws.onmessage = (ev) => {
            self.notifyListeners('message', { id, data: ev.data });
        };
        ws.onopen = () => {
            self.notifyListeners('open', { id });
        };
        __classPrivateFieldGet(this, _websockets).set(id, ws);
        return { id };
    }
    async send(options) {
        const ws = __classPrivateFieldGet(this, _websockets).get(options.id);
        if (!ws) {
            throw new Error('WebSocket not found');
        }
        ws.send(options.data);
    }
    async close(options) {
        const ws = __classPrivateFieldGet(this, _websockets).get(options.id);
        if (!ws) {
            throw new Error('WebSocket not found');
        }
        ws.close(options.code, options.reason);
    }
}
_websockets = new WeakMap(), _id = new WeakMap();
//# sourceMappingURL=web.js.map