/**
 * change-detector.ts — Figma plugin document change detection.
 * Runs in Figma sandbox — no DOM, no window.
 *
 * Registers the documentchange listener and emits CANVAS_CHANGED messages to UI.
 */

/// <reference path="../../figma.d.ts" />

import type { CanvasChangedPayload } from '../types/figma-plugin-types';
import type { RawNodeChange } from '../ui/lib/canvas-change-detector';

/** Properties that signal design-relevant changes */
const DESIGN_PROPS = new Set([
  'fills', 'strokes', 'fillStyleId', 'strokeStyleId',
  'fontSize', 'fontName', 'letterSpacing', 'lineHeight', 'textStyleId',
  'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing',
  'layoutMode',
]);

/**
 * Register the documentchange event listener.
 * Filters for design-relevant property changes and posts CANVAS_CHANGED to UI.
 */
export function registerChangeDetector(
  sendToUI: <T = unknown>(msg: { id: string; type: string; payload: T }) => void,
): void {
  figma.on('documentchange', (event: DocumentChangeEvent) => {
    const rawChanges: RawNodeChange[] = [];

    for (const change of event.documentChanges) {
      if (change.type !== 'PROPERTY_CHANGE') continue;
      const node = change.node;
      if (!node || node.removed) continue;

      const relevant = change.properties.filter((p: string) => DESIGN_PROPS.has(p));
      if (relevant.length === 0) continue;

      rawChanges.push({
        id: node.id,
        name: (node as SceneNode).name ?? node.id,
        type: node.type,
        changedProperties: relevant,
      });
    }

    if (rawChanges.length > 0) {
      sendToUI<CanvasChangedPayload>({
        id: `change_${Date.now()}`,
        type: 'CANVAS_CHANGED',
        payload: { changes: rawChanges as unknown as CanvasChangedPayload['changes'] },
      });
    }
  });
}
