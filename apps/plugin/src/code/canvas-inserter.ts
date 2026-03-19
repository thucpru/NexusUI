/**
 * canvas-inserter.ts — Figma plugin canvas insertion logic.
 * Runs in Figma sandbox — no DOM, no window.
 *
 * Exports insertDesignToCanvas() and renderComponentToCanvas() for use in code.ts.
 */

/// <reference path="../../figma.d.ts" />

import type { ComponentNode } from '../types/figma-plugin-types';

/** Create a simple design token showcase frame on canvas */
export async function insertDesignToCanvas(tokens: Record<string, unknown>): Promise<void> {
  const frame = figma.createFrame();
  frame.name = 'Design Tokens — NexusUI';
  frame.resize(400, 200);
  frame.fills = [{ type: 'SOLID', color: { r: 0.17, g: 0.17, b: 0.17 } }];
  frame.layoutMode = 'VERTICAL';
  frame.paddingLeft = 16;
  frame.paddingRight = 16;
  frame.paddingTop = 16;
  frame.paddingBottom = 16;
  frame.itemSpacing = 8;
  frame.primaryAxisSizingMode = 'AUTO';

  const label = figma.createText();
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  label.characters = 'Design Tokens';
  label.fontSize = 14;
  label.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  frame.appendChild(label);

  figma.currentPage.appendChild(frame);
  figma.viewport.scrollAndZoomIntoView([frame]);
  // tokens param reserved for future per-token rendering
  void tokens;
}

/** Render a component tree JSON → Figma node hierarchy on canvas */
export async function renderComponentToCanvas(
  root: ComponentNode,
  referenceNodeId?: string,
): Promise<void> {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  const node = await buildFigmaNode(root);
  figma.currentPage.appendChild(node);

  // Position near reference node if provided
  if (referenceNodeId) {
    const ref = figma.getNodeById(referenceNodeId) as SceneNode | null;
    if (ref && 'x' in ref) {
      (node as SceneNode & { x: number; y: number }).x = ref.x + (ref as { width: number }).width + 40;
      (node as SceneNode & { y: number }).y = (ref as { y: number }).y;
    }
  }

  figma.viewport.scrollAndZoomIntoView([node]);
}

/** Recursively build Figma nodes from component tree JSON */
async function buildFigmaNode(def: ComponentNode): Promise<SceneNode> {
  switch (def.type) {
    case 'TEXT': {
      const text = figma.createText();
      text.name = def.name;
      text.characters = def.text ?? '';
      text.fontSize = def.fontSize ?? 12;
      if (def.fills && def.fills.length > 0) {
        text.fills = def.fills.map((f) => ({
          type: 'SOLID' as const,
          color: { r: f.r, g: f.g, b: f.b },
          opacity: f.a ?? 1,
        }));
      }
      return text;
    }

    case 'RECTANGLE': {
      const rect = figma.createRectangle();
      rect.name = def.name;
      rect.resize(def.width ?? 100, def.height ?? 40);
      if (def.cornerRadius) rect.cornerRadius = def.cornerRadius;
      if (def.fills && def.fills.length > 0) {
        rect.fills = def.fills.map((f) => ({
          type: 'SOLID' as const,
          color: { r: f.r, g: f.g, b: f.b },
          opacity: f.a ?? 1,
        }));
      }
      return rect;
    }

    case 'FRAME':
    case 'AUTOLAYOUT': {
      const frame = figma.createFrame();
      frame.name = def.name;
      frame.resize(def.width ?? 200, def.height ?? 100);

      if (def.fills && def.fills.length > 0) {
        frame.fills = def.fills.map((f) => ({
          type: 'SOLID' as const,
          color: { r: f.r, g: f.g, b: f.b },
          opacity: f.a ?? 1,
        }));
      } else {
        frame.fills = [];
      }

      if (def.layoutMode || def.type === 'AUTOLAYOUT') {
        frame.layoutMode = def.layoutMode ?? 'VERTICAL';
        frame.paddingLeft = def.paddingLeft ?? 0;
        frame.paddingRight = def.paddingRight ?? 0;
        frame.paddingTop = def.paddingTop ?? 0;
        frame.paddingBottom = def.paddingBottom ?? 0;
        frame.itemSpacing = def.itemSpacing ?? 0;
        frame.primaryAxisSizingMode = 'AUTO';
        frame.counterAxisSizingMode = 'AUTO';
      }

      if (def.cornerRadius) frame.cornerRadius = def.cornerRadius;

      if (def.children) {
        for (const childDef of def.children) {
          const childNode = await buildFigmaNode(childDef);
          frame.appendChild(childNode);
        }
      }

      return frame;
    }

    default: {
      // Fallback: plain frame
      const frame = figma.createFrame();
      frame.name = def.name;
      frame.resize(def.width ?? 100, def.height ?? 100);
      return frame;
    }
  }
}
