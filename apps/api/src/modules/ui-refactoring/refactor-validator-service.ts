/**
 * RefactorValidatorService — validates that a refactored component preserves
 * all business logic by comparing AST node signatures before/after.
 */
import { Injectable, Logger } from '@nestjs/common';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { LogicValidation } from '@nexusui/shared';

interface LogicSignature {
  hooks: string[];
  handlers: string[];
  fetchCalls: string[];
  propNames: string[];
}

@Injectable()
export class RefactorValidatorService {
  private readonly logger = new Logger(RefactorValidatorService.name);

  /**
   * Compare before/after code to verify logic nodes are preserved.
   * Returns safe:true only when all logic signatures match.
   */
  validateRefactoring(beforeCode: string, afterCode: string): LogicValidation {
    const warnings: string[] = [];

    try {
      const beforeSigs = this.extractSignatures(beforeCode);
      const afterSigs = this.extractSignatures(afterCode);

      // Check hooks are preserved
      const missingHooks = beforeSigs.hooks.filter((h) => !afterSigs.hooks.includes(h));
      if (missingHooks.length > 0) {
        warnings.push(`Missing hooks after refactor: ${missingHooks.join(', ')}`);
      }

      // Check event handlers are preserved
      const missingHandlers = beforeSigs.handlers.filter((h) => !afterSigs.handlers.includes(h));
      if (missingHandlers.length > 0) {
        warnings.push(`Missing event handlers after refactor: ${missingHandlers.join(', ')}`);
      }

      // Check API/fetch calls are preserved
      const missingFetch = beforeSigs.fetchCalls.filter((f) => !afterSigs.fetchCalls.includes(f));
      if (missingFetch.length > 0) {
        warnings.push(`Missing fetch/API calls after refactor: ${missingFetch.join(', ')}`);
      }

      // Check prop interface compatibility
      const removedProps = beforeSigs.propNames.filter((p) => !afterSigs.propNames.includes(p));
      if (removedProps.length > 0) {
        warnings.push(`Removed props detected: ${removedProps.join(', ')}`);
      }

      const safe = warnings.length === 0;
      if (!safe) {
        this.logger.warn(`Validation found ${warnings.length} issues`);
      }

      return { safe, warnings };
    } catch (err) {
      this.logger.error(`Validation parse error: ${(err as Error).message}`);
      return { safe: false, warnings: [`Parse error during validation: ${(err as Error).message}`] };
    }
  }

  private extractSignatures(code: string): LogicSignature {
    const hooks: string[] = [];
    const handlers: string[] = [];
    const fetchCalls: string[] = [];
    const propNames: string[] = [];

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      traverse(ast, {
        // Collect hook call names
        CallExpression(path) {
          if (!t.isIdentifier(path.node.callee)) return;
          const name = path.node.callee.name;
          const HOOKS = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useReducer'];
          if (HOOKS.includes(name) && !hooks.includes(name)) {
            hooks.push(name);
          }
          // Detect fetch/axios calls
          if ((name === 'fetch' || name === 'axios') && !fetchCalls.includes(name)) {
            fetchCalls.push(name);
          }
          // Detect named API calls (e.g. apiCall, getData, etc.)
          if (/^(get|post|put|delete|patch|fetch|api|load|submit)/i.test(name)) {
            if (!fetchCalls.includes(name)) fetchCalls.push(name);
          }
        },

        // Collect event handler variable names (onClick, onSubmit, etc.)
        VariableDeclarator(path) {
          if (!t.isIdentifier(path.node.id)) return;
          const name = path.node.id.name;
          if (/^handle[A-Z]|^on[A-Z]/.test(name) && !handlers.includes(name)) {
            handlers.push(name);
          }
        },

        // Collect prop names from TypeScript interface / destructured params
        TSPropertySignature(path) {
          if (t.isIdentifier(path.node.key)) {
            const name = path.node.key.name;
            if (!propNames.includes(name)) propNames.push(name);
          }
        },

        // Collect destructured props in function params
        ObjectPattern(path) {
          if (!t.isArrowFunctionExpression(path.parent) && !t.isFunctionDeclaration(path.parent)) return;
          path.node.properties.forEach((prop) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              if (!propNames.includes(prop.key.name)) propNames.push(prop.key.name);
            }
          });
        },
      });
    } catch {
      // Return partial results on parse error
    }

    return { hooks, handlers, fetchCalls, propNames };
  }
}
