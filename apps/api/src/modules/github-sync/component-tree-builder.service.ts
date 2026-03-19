/**
 * ComponentTreeBuilderService — walks Babel AST to produce a
 * standardized component tree: { name, type, children, props, className, inlineStyles }
 * Max depth: 10 levels (flattened beyond that to avoid Figma canvas overload).
 */
import { Injectable, Logger } from '@nestjs/common';
import * as parser from '@babel/parser';
import type { RepoFileContent } from './github-repo-reader.service';

const MAX_DEPTH = 10;

export interface ComponentNode {
  name: string;
  type: string;
  props: Record<string, string>;
  className: string;
  inlineStyles: Record<string, string>;
  children: ComponentNode[];
}

@Injectable()
export class ComponentTreeBuilderService {
  private readonly logger = new Logger(ComponentTreeBuilderService.name);

  /**
   * Builds a component tree from all provided JSX/TSX files.
   * Returns top-level component roots.
   */
  buildTrees(files: RepoFileContent[]): ComponentNode[] {
    const roots: ComponentNode[] = [];

    for (const file of files) {
      if (!file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) continue;

      try {
        const tree = this.buildTreeFromFile(file);
        if (tree) roots.push(tree);
      } catch (err) {
        this.logger.warn(`Failed to build tree for ${file.path}: ${(err as Error).message}`);
      }
    }

    return roots;
  }

  private buildTreeFromFile(file: RepoFileContent): ComponentNode | null {
    const ast = parser.parse(file.content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    const name = this.inferName(file.path);

    // Find JSXElement root in the return statement
    const jsxRoot = this.findFirstJsxElement(ast as unknown as Record<string, unknown>);
    if (!jsxRoot) return null;

    return {
      name,
      type: 'COMPONENT',
      props: {},
      className: '',
      inlineStyles: {},
      children: [this.buildNode(jsxRoot, 0)],
    };
  }

  private buildNode(jsxElement: Record<string, unknown>, depth: number): ComponentNode {
    const opening = jsxElement['openingElement'] as Record<string, unknown>;
    const nameNode = opening?.['name'] as Record<string, unknown>;

    const elementName = String(
      nameNode?.['name'] ?? (nameNode?.['property'] as Record<string, unknown>)?.['name'] ?? 'unknown',
    );

    const attrs = (opening?.['attributes'] as Record<string, unknown>[]) ?? [];
    const { className, props, inlineStyles } = this.extractAttributes(attrs);

    const node: ComponentNode = {
      name: elementName,
      type: this.mapElementType(elementName),
      props,
      className,
      inlineStyles,
      children: [],
    };

    // Recurse into children if depth < MAX_DEPTH
    if (depth < MAX_DEPTH) {
      const jsxChildren = (jsxElement['children'] as Record<string, unknown>[]) ?? [];
      for (const child of jsxChildren) {
        if (child['type'] === 'JSXElement') {
          node.children.push(this.buildNode(child, depth + 1));
        }
      }
    }

    return node;
  }

  private extractAttributes(attrs: Record<string, unknown>[]): {
    className: string;
    props: Record<string, string>;
    inlineStyles: Record<string, string>;
  } {
    let className = '';
    const props: Record<string, string> = {};
    let inlineStyles: Record<string, string> = {};

    for (const attr of attrs) {
      if (attr['type'] !== 'JSXAttribute') continue;

      const nameNode = attr['name'] as Record<string, unknown>;
      const valueNode = attr['value'] as Record<string, unknown>;
      const attrName = String(nameNode?.['name'] ?? '');

      if (attrName === 'className' && valueNode?.['type'] === 'StringLiteral') {
        className = String(valueNode['value']);
      } else if (attrName === 'style' && valueNode?.['type'] === 'JSXExpressionContainer') {
        inlineStyles = this.extractStyleObject(
          (valueNode['expression'] as Record<string, unknown>) ?? {},
        );
      } else if (valueNode?.['type'] === 'StringLiteral') {
        props[attrName] = String(valueNode['value']);
      }
    }

    return { className, props, inlineStyles };
  }

  private extractStyleObject(expr: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    if (expr['type'] !== 'ObjectExpression') return result;

    const properties = (expr['properties'] as Record<string, unknown>[]) ?? [];
    for (const prop of properties) {
      if (prop['type'] !== 'ObjectProperty') continue;
      const keyNode = prop['key'] as Record<string, unknown>;
      const valNode = prop['value'] as Record<string, unknown>;
      const key = String(keyNode?.['name'] ?? keyNode?.['value'] ?? '');
      const val = String(valNode?.['value'] ?? '');
      if (key && val) result[key] = val;
    }

    return result;
  }

  /** Determines a semantic type from the HTML tag name */
  private mapElementType(tag: string): string {
    const lower = tag.toLowerCase();
    if (['div', 'section', 'article', 'main', 'aside', 'nav', 'header', 'footer'].includes(lower))
      return 'CONTAINER';
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'label', 'strong', 'em'].includes(lower))
      return 'TEXT';
    if (lower === 'button') return 'BUTTON';
    if (lower === 'img') return 'IMAGE';
    if (lower === 'input' || lower === 'textarea' || lower === 'select') return 'INPUT';
    // Custom React component (capitalized)
    if (tag[0] === tag[0]?.toUpperCase() && tag[0] !== tag[0]?.toLowerCase()) return 'COMPONENT';
    return 'ELEMENT';
  }

  /** BFS traversal to find first JSXElement in AST */
  private findFirstJsxElement(node: Record<string, unknown>): Record<string, unknown> | null {
    if (!node || typeof node !== 'object') return null;

    if (node['type'] === 'JSXElement') return node;

    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          const found = this.findFirstJsxElement(item as Record<string, unknown>);
          if (found) return found;
        }
      } else if (child && typeof child === 'object' && (child as Record<string, unknown>)['type']) {
        const found = this.findFirstJsxElement(child as Record<string, unknown>);
        if (found) return found;
      }
    }

    return null;
  }

  private inferName(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    const file = parts[parts.length - 1] ?? filePath;
    return file.replace(/\.(tsx|jsx)$/, '');
  }
}
