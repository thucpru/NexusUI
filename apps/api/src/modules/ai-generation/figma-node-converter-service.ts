/**
 * FigmaNodeConverterService — converts structured AI output into Figma-compatible
 * node descriptors that the plugin can use to create/update frames and layers.
 *
 * Mapping: component code + styles → Figma frame nodes with fills, text, auto-layout.
 * This is a best-effort semantic mapping (CSS → Figma properties).
 */
import { Injectable, Logger } from '@nestjs/common';
import type { ParsedGenerationOutput } from './output-parser-service';

/** Figma RGBA color */
interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Figma solid fill */
interface FigmaFill {
  type: 'SOLID';
  color: FigmaColor;
}

/** Figma auto-layout config */
interface FigmaAutoLayout {
  layoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  itemSpacing: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

/** Minimal Figma node descriptor */
export interface FigmaNode {
  type: 'FRAME' | 'TEXT' | 'COMPONENT';
  name: string;
  description: string;
  fills: FigmaFill[];
  autoLayout: FigmaAutoLayout;
  width: number;
  height: number;
  cornerRadius: number;
  codeSnippet: string;
  language: string;
}

/** Full output for the Figma plugin */
export interface FigmaConvertedOutput {
  nodes: FigmaNode[];
  metadata: {
    framework: string;
    componentCount: number;
    generatedAt: string;
  };
}

@Injectable()
export class FigmaNodeConverterService {
  private readonly logger = new Logger(FigmaNodeConverterService.name);

  /** Convert parsed AI output to Figma node descriptors */
  convert(
    output: ParsedGenerationOutput,
    framework: string,
  ): FigmaConvertedOutput {
    const nodes: FigmaNode[] = output.components.map((comp) =>
      this.componentToNode(comp, output),
    );

    this.logger.debug(`Converted ${nodes.length} component(s) to Figma nodes`);

    return {
      nodes,
      metadata: {
        framework,
        componentCount: nodes.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private componentToNode(
    comp: ParsedGenerationOutput['components'][number],
    output: ParsedGenerationOutput,
  ): FigmaNode {
    const layoutMode = this.mapLayoutMode(output.layout.type, output.layout.direction);
    const itemSpacing = this.parseSpacing(output.layout.gap);

    return {
      type: 'COMPONENT',
      name: comp.name,
      description: comp.description,
      fills: this.buildFills(output.styles),
      autoLayout: {
        layoutMode,
        itemSpacing,
        paddingTop: 16,
        paddingRight: 16,
        paddingBottom: 16,
        paddingLeft: 16,
      },
      width: 320,    // Default width — plugin adjusts from code
      height: 0,     // Auto height
      cornerRadius: 0,
      codeSnippet: comp.code,
      language: comp.language,
    };
  }

  private mapLayoutMode(
    type: string,
    direction: string,
  ): 'HORIZONTAL' | 'VERTICAL' | 'NONE' {
    if (type === 'flex' || type === 'grid') {
      return direction === 'row' ? 'HORIZONTAL' : 'VERTICAL';
    }
    return 'NONE';
  }

  private parseSpacing(gap: string): number {
    const num = parseFloat(gap);
    return isNaN(num) ? 8 : num;
  }

  private buildFills(styles: ParsedGenerationOutput['styles']): FigmaFill[] {
    // Look for background color token in overrides or tokens
    const bgColor = (styles.overrides as Record<string, unknown>)?.['backgroundColor'] as string | undefined
      ?? (styles.tokens as Record<string, unknown>)?.['backgroundColor'] as string | undefined;

    if (bgColor) {
      const color = this.hexToFigmaColor(bgColor);
      if (color) return [{ type: 'SOLID', color }];
    }

    // Default: white fill
    return [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }];
  }

  private hexToFigmaColor(hex: string): FigmaColor | null {
    const clean = hex.replace('#', '');
    if (clean.length !== 6 && clean.length !== 8) return null;
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
}
