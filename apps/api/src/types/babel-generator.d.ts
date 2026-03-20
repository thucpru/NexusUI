/**
 * Type declaration for @babel/generator (no official @types package).
 * Provides minimal typing sufficient for code generation usage.
 */
declare module '@babel/generator' {
  import type { Node } from '@babel/types';

  interface GeneratorOptions {
    retainLines?: boolean;
    compact?: boolean | 'auto';
    concise?: boolean;
    jsescOption?: Record<string, unknown>;
  }

  interface GeneratorResult {
    code: string;
    map: unknown;
    rawMappings: unknown;
  }

  function generate(ast: Node, opts?: GeneratorOptions, code?: string | Record<string, string>): GeneratorResult;

  export default generate;
}
