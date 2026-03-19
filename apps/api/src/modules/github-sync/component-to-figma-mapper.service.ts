/**
 * ComponentToFigmaMapperService — maps component tree nodes to
 * Figma-renderable JSON (Frames with AutoLayout, Text nodes, Rectangles).
 *
 * Mapping rules:
 *   CONTAINER/div + flex class → Frame with AutoLayout (HORIZONTAL or VERTICAL)
 *   TEXT/p/h1/span             → Text node
 *   BUTTON                     → Frame with Text child
 *   Everything else            → Rectangle
 */
import { Injectable } from '@nestjs/common';
import type { ComponentNode } from './component-tree-builder.service';
import type { FigmaNode } from './dto/sync-status-dto';

/** Tailwind spacing → px (for padding/gap) */
const SPACING: Record<string, number> = {
  'p-1': 4, 'p-2': 8, 'p-3': 12, 'p-4': 16, 'p-6': 24, 'p-8': 32,
  'px-2': 8, 'px-4': 16, 'py-2': 8, 'py-4': 16,
  'gap-1': 4, 'gap-2': 8, 'gap-4': 16, 'gap-6': 24,
};

/** Tailwind color → RGB (0–1 range for Figma) */
const COLORS: Record<string, { r: number; g: number; b: number }> = {
  'bg-white': { r: 1, g: 1, b: 1 },
  'bg-black': { r: 0, g: 0, b: 0 },
  'bg-gray-50': { r: 0.98, g: 0.98, b: 0.98 },
  'bg-gray-100': { r: 0.95, g: 0.96, b: 0.96 },
  'bg-blue-500': { r: 0.23, g: 0.51, b: 0.96 },
  'bg-red-500': { r: 0.94, g: 0.27, b: 0.27 },
  'bg-green-500': { r: 0.13, g: 0.77, b: 0.37 },
  'text-white': { r: 1, g: 1, b: 1 },
  'text-black': { r: 0, g: 0, b: 0 },
  'text-gray-500': { r: 0.42, g: 0.45, b: 0.50 },
  'text-blue-500': { r: 0.23, g: 0.51, b: 0.96 },
};

/** Tailwind font size → px */
const FONT_SIZES: Record<string, number> = {
  'text-xs': 12, 'text-sm': 14, 'text-base': 16, 'text-lg': 18,
  'text-xl': 20, 'text-2xl': 24, 'text-3xl': 30, 'text-4xl': 36,
};

/** Tailwind font weight → numeric */
const FONT_WEIGHTS: Record<string, number> = {
  'font-light': 300, 'font-normal': 400, 'font-medium': 500,
  'font-semibold': 600, 'font-bold': 700,
};

@Injectable()
export class ComponentToFigmaMapperService {
  /**
   * Converts an array of component roots to Figma node specs.
   */
  mapComponentTrees(roots: ComponentNode[]): FigmaNode[] {
    return roots.map((root) => this.mapNode(root));
  }

  private mapNode(node: ComponentNode): FigmaNode {
    const classes = node.className.split(/\s+/).filter(Boolean);

    switch (node.type) {
      case 'CONTAINER':
      case 'COMPONENT':
        return this.mapContainer(node, classes);
      case 'TEXT':
        return this.mapText(node, classes);
      case 'BUTTON':
        return this.mapButton(node, classes);
      default:
        return this.mapRectangle(node, classes);
    }
  }

  private mapContainer(node: ComponentNode, classes: string[]): FigmaNode {
    const isRow = classes.some((c) => c === 'flex-row' || c === 'flex');
    const isCol = classes.includes('flex-col');

    const figma: FigmaNode = {
      type: 'FRAME',
      name: node.name,
      layoutMode: isRow && !isCol ? 'HORIZONTAL' : isCol ? 'VERTICAL' : 'NONE',
      children: node.children.map((c) => this.mapNode(c)),
      fills: [],
    };

    this.applySpacing(figma, classes);
    this.applyBackground(figma, classes);

    return figma;
  }

  private mapText(node: ComponentNode, classes: string[]): FigmaNode {
    const textColor = this.resolveColor(classes, 'text-');
    const figma: FigmaNode = {
      type: 'TEXT',
      name: node.name,
      characters: node.props['children'] ?? node.name,
      fontSize: this.resolveFontSize(classes),
      fontWeight: this.resolveFontWeight(classes),
      fills: textColor ? [{ type: 'SOLID', color: textColor }] : [],
    };

    return figma;
  }

  private mapButton(node: ComponentNode, classes: string[]): FigmaNode {
    const bgColor = this.resolveColor(classes, 'bg-');
    const figma: FigmaNode = {
      type: 'FRAME',
      name: node.name,
      layoutMode: 'HORIZONTAL',
      fills: bgColor ? [{ type: 'SOLID', color: bgColor }] : [],
      children: node.children.map((c) => this.mapNode(c)),
    };

    this.applySpacing(figma, classes);
    return figma;
  }

  private mapRectangle(node: ComponentNode, classes: string[]): FigmaNode {
    const bgColor = this.resolveColor(classes, 'bg-');
    return {
      type: 'RECTANGLE',
      name: node.name,
      fills: bgColor ? [{ type: 'SOLID', color: bgColor }] : [],
    };
  }

  private applySpacing(figma: FigmaNode, classes: string[]): void {
    for (const cls of classes) {
      const val = SPACING[cls];
      if (!val) continue;

      if (cls.startsWith('p-')) {
        figma.paddingTop = val;
        figma.paddingRight = val;
        figma.paddingBottom = val;
        figma.paddingLeft = val;
      } else if (cls.startsWith('px-')) {
        figma.paddingLeft = val;
        figma.paddingRight = val;
      } else if (cls.startsWith('py-')) {
        figma.paddingTop = val;
        figma.paddingBottom = val;
      } else if (cls.startsWith('gap-')) {
        figma.itemSpacing = val;
      }
    }
  }

  private applyBackground(figma: FigmaNode, classes: string[]): void {
    const color = this.resolveColor(classes, 'bg-');
    if (color) {
      figma.fills = [{ type: 'SOLID', color }];
    }
  }

  private resolveColor(
    classes: string[],
    prefix: string,
  ): { r: number; g: number; b: number } | null {
    for (const cls of classes) {
      if (cls.startsWith(prefix)) {
        const key = Object.keys(COLORS).find((k) => k === cls);
        if (key) return COLORS[key] ?? null;
      }
    }
    return null;
  }

  private resolveFontSize(classes: string[]): number {
    for (const cls of classes) {
      if (FONT_SIZES[cls]) return FONT_SIZES[cls]!;
    }
    return 16; // default
  }

  private resolveFontWeight(classes: string[]): number {
    for (const cls of classes) {
      if (FONT_WEIGHTS[cls]) return FONT_WEIGHTS[cls]!;
    }
    return 400; // default
  }
}
