/**
 * use-figma-message.ts
 * postMessage bridge hook — listens to messages from code.ts and dispatches to handlers.
 */

import { useEffect, useCallback } from 'preact/hooks';
import type { PluginMessage } from '../../types/figma-plugin-types';
import { resolveAck, resolveWithData } from '../lib/figma-api-bridge';

type MessageHandler = (msg: PluginMessage) => void;

/**
 * Register a handler for messages from the Figma code sandbox.
 * Automatically resolves pending promises for ACK messages.
 */
export function useFigmaMessage(onMessage: MessageHandler): void {
  const handler = useCallback(
    (event: MessageEvent) => {
      const msg = event.data?.pluginMessage as PluginMessage | undefined;
      if (!msg || !msg.type) return;

      // Auto-resolve ACK messages for pending sendToCode() calls
      if (msg.type === 'ACK') {
        const ack = msg as unknown as { id: string; success: boolean; error?: string };
        resolveAck(ack.id, ack.success, ack.error);
        return;
      }

      // If message has an ID and a result payload, resolve promise
      if (msg.id && msg.payload !== undefined) {
        resolveWithData(msg.id, msg.payload);
      }

      onMessage(msg);
    },
    [onMessage],
  );

  useEffect(() => {
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [handler]);
}
