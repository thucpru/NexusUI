/**
 * token-extractor.ts — Figma plugin token extraction logic.
 * Runs in Figma sandbox — no DOM, no window.
 *
 * Exports extractDesignTokens() for use in code.ts message handler.
 */

/// <reference path="../../figma.d.ts" />

import type { RawTokenData, RawPaintStyle, RawTextStyle, RawSpacingValue } from '../ui/lib/design-token-extractor';

/** Extract all design tokens (colors, typography, spacing) from the current Figma file */
export async function extractDesignTokens(): Promise<RawTokenData> {
  const paintStyles: RawPaintStyle[] = [];
  const textStyles: RawTextStyle[] = [];
  const spacingValues: RawSpacingValue[] = [];

  // Extract paint styles from file
  for (const style of figma.getLocalPaintStyles()) {
    const solidPaint = style.paints.find((p) => p.type === 'SOLID') as SolidPaint | undefined;
    if (!solidPaint) continue;
    paintStyles.push({
      id: style.id,
      name: style.name,
      r: solidPaint.color.r,
      g: solidPaint.color.g,
      b: solidPaint.color.b,
      a: solidPaint.opacity ?? 1,
    });
  }

  // Extract text styles
  for (const style of figma.getLocalTextStyles()) {
    const lh = style.lineHeight;
    const lsPx = style.letterSpacing;
    textStyles.push({
      id: style.id,
      name: style.name,
      fontFamily: style.fontName.family,
      fontSize: style.fontSize,
      fontWeight: fontWeightFromName(style.fontName.style),
      lineHeightPx: lh.unit === 'PIXELS' ? lh.value : style.fontSize * 1.4,
      letterSpacing: lsPx.unit === 'PIXELS' ? lsPx.value : 0,
    });
  }

  // Walk auto-layout nodes for spacing values
  walkNodes(figma.currentPage, (node) => {
    if ('layoutMode' in node && (node as FrameNode).layoutMode !== 'NONE') {
      const frame = node as FrameNode;
      const values = [
        frame.paddingLeft,
        frame.paddingRight,
        frame.paddingTop,
        frame.paddingBottom,
        frame.itemSpacing,
      ].filter((v) => v > 0);
      for (const v of values) {
        spacingValues.push({ name: `spacing-${v}`, value: v });
      }
    }
  });

  return { paintStyles, textStyles, spacingValues };
}

/** Walk all descendant nodes calling visitor for each */
export function walkNodes(node: BaseNode, visitor: (n: BaseNode) => void): void {
  visitor(node);
  if ('children' in node) {
    for (const child of (node as ChildrenMixin).children) {
      walkNodes(child, visitor);
    }
  }
}

/** Map font style string to numeric weight */
function fontWeightFromName(style: string): number {
  const s = style.toLowerCase();
  if (s.includes('thin')) return 100;
  if (s.includes('extralight') || s.includes('ultra light')) return 200;
  if (s.includes('light')) return 300;
  if (s.includes('medium')) return 500;
  if (s.includes('semibold') || s.includes('demi')) return 600;
  if (s.includes('bold') && s.includes('extra')) return 800;
  if (s.includes('bold')) return 700;
  if (s.includes('black') || s.includes('heavy')) return 900;
  return 400;
}
