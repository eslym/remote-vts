import { WebPlugin } from '@capacitor/core';

import type { CapacitorWSPlugin } from './definitions';

export class CapacitorWSWeb extends WebPlugin implements CapacitorWSPlugin {
  #websockets: Map<string, WebSocket> = new Map();
  #id = 0;

  async connect(options: { url: string }): Promise<{ id: string }> {
    const ws = new WebSocket(options.url);
    const id = (this.#id++).toString();
    const self = this;
    ws.onclose = (ev) => {
      self.notifyListeners('close', { id, code: ev.code, reason: ev.reason });
      self.#websockets.delete(id);
    };
    ws.onerror = () => {
      self.notifyListeners('error', { id, message: '' });
      self.#websockets.delete(id);
    };
    ws.onmessage = (ev) => {
      self.notifyListeners('message', { id, data: ev.data });
    };
    ws.onopen = () => {
      self.notifyListeners('open', { id });
    };
    this.#websockets.set(id, ws);
    return {id};
  }

  async send(options: { id: string; data: string }): Promise<void> {
    const ws = this.#websockets.get(options.id);
    if (!ws) {
      throw new Error('WebSocket not found');
    }
    ws.send(options.data);
  }

  async close(options: { id: string; code?: number; reason?: string }): Promise<void> {
    const ws = this.#websockets.get(options.id);
    if (!ws) {
      throw new Error('WebSocket not found');
    }
    ws.close(options.code, options.reason);
  }
}
