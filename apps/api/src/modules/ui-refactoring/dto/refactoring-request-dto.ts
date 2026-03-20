/**
 * Refactoring DTOs — re-export Zod-inferred types for use with ZodValidationPipe.
 * All validation is handled via ZodValidationPipe(schema) in controller params.
 */
import {
  scanComponentsSchema,
  beautifyComponentSchema,
  generatePrSchema,
  refactoringJobQuerySchema,
} from '@nexusui/shared';

// ─── Re-export schemas for use in controller ──────────────────────────────────
export {
  scanComponentsSchema,
  beautifyComponentSchema,
  generatePrSchema,
  refactoringJobQuerySchema,
};

// ─── Re-export inferred types as DTO aliases ──────────────────────────────────
export type {
  ScanComponentsInput as ScanComponentsDto,
  BeautifyComponentInput as BeautifyComponentDto,
  GeneratePrInput as GeneratePrDto,
  RefactoringJobQueryInput as RefactoringJobQueryDto,
} from '@nexusui/shared';
