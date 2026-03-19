/**
 * figma-api-bridge.ts
 * code↔ui communication protocol with message IDs and ack/response correlation.
 * Used by BOTH code.ts (sandbox) and UI thread.
 */

import type { PluginMessage, PluginMessageType } from '../../types/figma-plugin-types';

let _msgCounter = 0;

/** Generate a unique message ID */
export function createMessageId(): string {
  return `msg_${Date.now()}_${++_msgCounter}`;
}

/** Build a typed plugin message with auto-generated ID */
export function buildMessage<T = unknown>(
  type: PluginMessageType,
  payload?: T,
): PluginMessage<T | undefined> {
  return { id: createMessageId(), type, payload };
}

/** Pending promise resolvers keyed by message ID (UI thread only) */
const _pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

/**
 * Send a message from the UI thread to code.ts and wait for an ACK.
 * Must only be called from the UI thread (has access to parent.postMessage).
 */
export function sendToCode<T = unknown, R = unknown>(
  type: PluginMessageType,
  payload?: T,
  timeoutMs = 5000,
): Promise<R> {
  const msg = buildMessage(type, payload);

  return new Promise<R>((resolve, reject) => {
    const timer = setTimeout(() => {
      _pending.delete(msg.id);
      reject(new Error(`Plugin message timeout: ${type} (${msg.id})`));
    }, timeoutMs);

    _pending.set(msg.id, {
      resolve: (v) => {
        clearTimeout(timer);
        resolve(v as R);
      },
      reject: (e) => {
        clearTimeout(timer);
        reject(e);
      },
    });

    parent.postMessage({ pluginMessage: msg }, '*');
  });
}

/**
 * Resolve a pending promise when an ACK arrives from code.ts (UI thread).
 * Call this inside your onmessage handler.
 */
export function resolveAck(msgId: string, success: boolean, error?: string): void {
  const pending = _pending.get(msgId);
  if (!pending) return;
  _pending.delete(msgId);
  if (success) {
    pending.resolve(undefined);
  } else {
    pending.reject(new Error(error ?? 'Plugin message failed'));
  }
}

/**
 * Notify UI that a pending request resolved with data (UI thread).
 * Used when code.ts sends back data (e.g., extracted tokens).
 */
export function resolveWithData(msgId: string, data: unknown): void {
  const pending = _pending.get(msgId);
  if (!pending) return;
  _pending.delete(msgId);
  pending.resolve(data);
}
