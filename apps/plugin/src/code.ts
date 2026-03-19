/**
 * code.ts — Figma Plugin sandbox entry point.
 * Runs in Figma's JS sandbox: NO DOM, NO window, NO fetch.
 * Access to figma.* API only.
 *
 * Delegates to:
 *   - code/token-extractor.ts  — EXTRACT_TOKENS handler
 *   - code/canvas-inserter.ts  — INSERT_DESIGN / RENDER_COMPONENT handlers
 *   - code/change-detector.ts  — documentchange listener
 */

/// <reference path="../figma.d.ts" />

import type {
  PluginMessage,
  AuthSetPayload,
  TokensExtractedPayload,
  RenderComponentPayload,
} from './types/figma-plugin-types';
import { extractDesignTokens } from './code/token-extractor';
import { insertDesignToCanvas, renderComponentToCanvas } from './code/canvas-inserter';
import { registerChangeDetector } from './code/change-detector';

// ─── Plugin Init ──────────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 320, height: 600, title: 'NexusUI' });

// Send init message so UI knows sandbox is ready
sendToUI({ id: 'init', type: 'INIT', payload: undefined });

// Register document change listener (design-token change detection)
registerChangeDetector((msg) => {
  figma.ui.postMessage(msg);
});

// ─── Message Handler ──────────────────────────────────────────────────────────

figma.ui.onmessage = async (rawMsg: PluginMessage) => {
  const msg = rawMsg as PluginMessage;
  if (!msg || !msg.type) return;

  try {
    switch (msg.type) {
      case 'AUTH_GET': {
        const token = await figma.clientStorage.getAsync('apiToken') as string | undefined;
        sendToUI<{ token: string | null }>({
          id: msg.id,
          type: 'AUTH_RESULT',
          payload: { token: token ?? null },
        });
        break;
      }

      case 'AUTH_SET': {
        const payload = msg.payload as AuthSetPayload;
        if (payload.token) {
          await figma.clientStorage.setAsync('apiToken', payload.token);
        } else {
          await figma.clientStorage.deleteAsync('apiToken');
        }
        ackMessage(msg.id, true);
        break;
      }

      case 'EXTRACT_TOKENS': {
        const tokens = await extractDesignTokens();
        sendToUI<TokensExtractedPayload>({
          id: msg.id,
          type: 'TOKENS_EXTRACTED',
          payload: { tokens: tokens as unknown as TokensExtractedPayload['tokens'] },
        });
        break;
      }

      case 'INSERT_DESIGN': {
        const payload = msg.payload as { tokens: Record<string, unknown> };
        await insertDesignToCanvas(payload.tokens);
        ackMessage(msg.id, true);
        break;
      }

      case 'RENDER_COMPONENT': {
        const payload = msg.payload as RenderComponentPayload;
        await renderComponentToCanvas(payload.root, payload.referenceNodeId);
        ackMessage(msg.id, true);
        break;
      }

      default:
        ackMessage(msg.id, false, `Unknown message type: ${msg.type}`);
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    ackMessage(msg.id, false, error);
  }
};

// ─── Messaging Helpers ────────────────────────────────────────────────────────

function sendToUI<T = unknown>(msg: PluginMessage<T>): void {
  figma.ui.postMessage(msg);
}

function ackMessage(id: string, success: boolean, error?: string): void {
  figma.ui.postMessage({ id, type: 'ACK', success, error });
}
