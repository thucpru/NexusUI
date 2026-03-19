/**
 * CodeParserService — parses JSX/TSX with Babel AST to extract
 * component structures and CSS/Tailwind design tokens.
 *
 * Tailwind constant maps are in ./tailwind-token-maps.ts.
 */
import { Injectable, Logger } from '@nestjs/common';
import * as parser from '@babel/parser';
import type { RepoFileContent } from './github-repo-reader.service';
import { TAILWIND_COLOR_MAP, TAILWIND_SPACING_MAP } from './tailwind-token-maps';

export interface ParsedComponent {
  name: string;
  filePath: string;
  /** JSX element names used in this component */
  elements: string[];
  classNames: string[];
  inlineStyles: Record<string, string>[];
}

export interface ParsedTokens {
  colors: Set<string>;
  fontSizes: Set<string>;
  fontFamilies: Set<string>;
  spacing: Set<string>;
}

@Injectable()
export class CodeParserService {
  private readonly logger = new Logger(CodeParserService.name);

  /** Parses JSX/TSX files and extracts component metadata + tokens. */
  parseFiles(files: RepoFileContent[]): {
    components: ParsedComponent[];
    tokens: ParsedTokens;
  } {
    const components: ParsedComponent[] = [];
    const tokens: ParsedTokens = {
      colors: new Set(),
      fontSizes: new Set(),
      fontFamilies: new Set(),
      spacing: new Set(),
    };

    for (const file of files) {
      if (!file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) continue;

      try {
        const parsed = this.parseJsxFile(file);
        if (parsed) {
          components.push(parsed);
          this.extractTokensFromComponent(parsed, tokens);
        }
      } catch (err) {
        this.logger.warn(`Failed to parse ${file.path}: ${(err as Error).message}`);
      }
    }

    // Extract tokens from CSS files
    for (const file of files) {
      if (file.path.endsWith('.css') || file.path.endsWith('.scss')) {
        this.extractTokensFromCss(file.content, tokens);
      }
    }

    return { components, tokens };
  }

  private parseJsxFile(file: RepoFileContent): ParsedComponent | null {
    const ast = parser.parse(file.content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    const component: ParsedComponent = {
      name: this.inferComponentName(file.path),
      filePath: file.path,
      elements: [],
      classNames: [],
      inlineStyles: [],
    };

    this.walkAst(ast as unknown as Record<string, unknown>, component);
    return component;
  }

  /** Walk AST nodes and collect JSX element names and className values */
  private walkAst(node: Record<string, unknown>, component: ParsedComponent): void {
    if (!node || typeof node !== 'object') return;

    if (node['type'] === 'JSXOpeningElement') {
      const nameNode = node['name'] as Record<string, unknown>;
      if (nameNode?.['name']) component.elements.push(String(nameNode['name']));
    }

    if (node['type'] === 'JSXAttribute') {
      const nameNode = node['name'] as Record<string, unknown>;
      const valueNode = node['value'] as Record<string, unknown>;

      if (nameNode?.['name'] === 'className' && valueNode?.['type'] === 'StringLiteral') {
        const classes = String(valueNode['value']).split(/\s+/).filter(Boolean);
        component.classNames.push(...classes);
      }

      if (nameNode?.['name'] === 'style' && valueNode?.['type'] === 'JSXExpressionContainer') {
        const expr = valueNode['expression'] as Record<string, unknown>;
        if (expr?.['type'] === 'ObjectExpression') {
          const styleObj = this.extractObjectExpression(expr);
          if (Object.keys(styleObj).length > 0) component.inlineStyles.push(styleObj);
        }
      }
    }

    // Recurse into children
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((c) => this.walkAst(c as Record<string, unknown>, component));
      } else if (child && typeof child === 'object' && (child as Record<string, unknown>)['type']) {
        this.walkAst(child as Record<string, unknown>, component);
      }
    }
  }

  private extractObjectExpression(node: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    const props = (node['properties'] as Record<string, unknown>[]) ?? [];

    for (const prop of props) {
      if (prop['type'] !== 'ObjectProperty') continue;
      const keyNode = prop['key'] as Record<string, unknown>;
      const valNode = prop['value'] as Record<string, unknown>;
      const key = String(keyNode?.['name'] ?? keyNode?.['value'] ?? '');
      const val = String(valNode?.['value'] ?? '');
      if (key && val) result[key] = val;
    }

    return result;
  }

  private extractTokensFromComponent(component: ParsedComponent, tokens: ParsedTokens): void {
    for (const cls of component.classNames) {
      const color = TAILWIND_COLOR_MAP[cls];
      if (color) tokens.colors.add(color);

      const spacing = TAILWIND_SPACING_MAP[cls];
      if (spacing) tokens.spacing.add(spacing);

      if (cls.startsWith('text-') && /text-\d+/.test(cls)) tokens.fontSizes.add(cls);
      if (cls.startsWith('font-')) tokens.fontFamilies.add(cls);
    }

    for (const style of component.inlineStyles) {
      if (style['color']) tokens.colors.add(style['color']);
      if (style['fontSize']) tokens.fontSizes.add(style['fontSize']);
      if (style['fontFamily']) tokens.fontFamilies.add(style['fontFamily']);
    }
  }

  private extractTokensFromCss(content: string, tokens: ParsedTokens): void {
    const hexColors = content.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    hexColors.forEach((c) => tokens.colors.add(c));

    const rgbColors = content.match(/rgb\([^)]+\)/g) ?? [];
    rgbColors.forEach((c) => tokens.colors.add(c));

    const fontSizes = content.match(/font-size:\s*[\d.]+(?:px|rem)/g) ?? [];
    fontSizes.forEach((f) => tokens.fontSizes.add(f.replace('font-size:', '').trim()));
  }

  private inferComponentName(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1] ?? filePath;
    return fileName.replace(/\.(tsx|jsx)$/, '');
  }
}
