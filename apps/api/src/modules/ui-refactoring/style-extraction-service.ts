/**
 * StyleExtractionService — parses React component source code with Babel AST
 * to extract styling info, classify nodes, and detect style issues.
 */
import { Injectable, Logger } from '@nestjs/common';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { StyleIssue, StyleIssueType, LogicSafety } from '@nexusui/shared';

export interface StylingNode {
  type: 'className' | 'inlineStyle' | 'cssImport';
  value: string;
  classification: 'STATIC' | 'DYNAMIC' | 'CONDITIONAL';
  line: number | undefined;
}

export interface LogicNode {
  type: string;
  name: string;
  signature: string;
}

export interface ExtractionResult {
  stylingNodes: StylingNode[];
  logicNodes: LogicNode[];
  safetyLevel: LogicSafety;
}

/** Regex patterns for detecting common style issues */
const HARDCODED_COLOR_PATTERN = /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(/;
const SPACING_PATTERN = /\d+px|\d+rem|\d+em/;
const RESPONSIVE_PATTERN = /sm:|md:|lg:|xl:|@media/;

@Injectable()
export class StyleExtractionService {
  private readonly logger = new Logger(StyleExtractionService.name);

  /** Parse source code and extract all styling-related AST nodes */
  extractStyling(sourceCode: string): ExtractionResult {
    const stylingNodes: StylingNode[] = [];
    const logicNodes: LogicNode[] = [];

    try {
      const ast = parser.parse(sourceCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      traverse(ast, {
        JSXAttribute(path) {
          const name = path.node.name;
          if (!t.isJSXIdentifier(name)) return;

          // Handle className attribute
          if (name.name === 'className') {
            const val = path.node.value;
            if (t.isStringLiteral(val)) {
              stylingNodes.push({
                type: 'className',
                value: val.value,
                classification: 'STATIC',
                line: path.node.loc?.start.line,
              });
            } else if (t.isJSXExpressionContainer(val)) {
              const expr = val.expression;
              const isDynamic = t.isCallExpression(expr) || t.isTemplateLiteral(expr);
              stylingNodes.push({
                type: 'className',
                value: sourceCode.slice(expr.start ?? 0, expr.end ?? 0),
                classification: isDynamic ? 'DYNAMIC' : 'CONDITIONAL',
                line: path.node.loc?.start.line,
              });
            }
          }

          // Handle style attribute
          if (name.name === 'style') {
            const val = path.node.value;
            if (t.isJSXExpressionContainer(val) && t.isObjectExpression(val.expression)) {
              stylingNodes.push({
                type: 'inlineStyle',
                value: sourceCode.slice(val.expression.start ?? 0, val.expression.end ?? 0),
                classification: 'DYNAMIC',
                line: path.node.loc?.start.line,
              });
            }
          }
        },

        // Collect CSS/SCSS imports
        ImportDeclaration(path) {
          const src = path.node.source.value;
          if (src.endsWith('.css') || src.endsWith('.scss') || src.endsWith('.module.css')) {
            stylingNodes.push({
              type: 'cssImport',
              value: src,
              classification: 'STATIC',
              line: path.node.loc?.start.line,
            });
          }
        },

        // Collect logic nodes (hooks, handlers)
        CallExpression(path) {
          if (!t.isIdentifier(path.node.callee)) return;
          const hookName = path.node.callee.name;
          const HOOKS = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'];
          if (HOOKS.includes(hookName)) {
            logicNodes.push({ type: 'hook', name: hookName, signature: `${hookName}()` });
          }
        },
      });
    } catch (err) {
      this.logger.warn(`AST parse error during extraction: ${(err as Error).message}`);
    }

    const safetyLevel = this.computeSafetyLevel(logicNodes, stylingNodes);
    return { stylingNodes, logicNodes, safetyLevel };
  }

  /** Detect style issues in source code and return typed issue list */
  detectStyleIssues(sourceCode: string): StyleIssue[] {
    const issues: StyleIssue[] = [];
    const lines = sourceCode.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Inline styles via style={{ ... }}
      if (/style=\{\{/.test(line)) {
        issues.push({ type: 'INLINE_STYLES' as StyleIssueType, detail: 'Inline style prop detected', line: lineNum });
      }

      // Hardcoded color values (skip comments)
      if (HARDCODED_COLOR_PATTERN.test(line) && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        issues.push({ type: 'HARDCODED_COLORS' as StyleIssueType, detail: 'Hardcoded color value found', line: lineNum });
      }

      // Hardcoded pixel/rem spacing (not in comments)
      if (SPACING_PATTERN.test(line) && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        issues.push({ type: 'INCONSISTENT_SPACING' as StyleIssueType, detail: 'Hardcoded spacing value found', line: lineNum });
      }
    });

    // Missing responsive breakpoints (whole-file check)
    if (!RESPONSIVE_PATTERN.test(sourceCode)) {
      issues.push({ type: 'MISSING_RESPONSIVE' as StyleIssueType, detail: 'No responsive breakpoints detected' });
    }

    return issues;
  }

  private computeSafetyLevel(logicNodes: LogicNode[], stylingNodes: StylingNode[]): LogicSafety {
    const hasDynamicStyling = stylingNodes.some((n) => n.classification === 'DYNAMIC');
    const hookCount = logicNodes.filter((n) => n.type === 'hook').length;

    if (hookCount > 5 || hasDynamicStyling) return 'RISKY';
    if (hookCount > 2) return 'MANUAL_REVIEW';
    return 'SAFE';
  }
}
