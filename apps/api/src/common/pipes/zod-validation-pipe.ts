/**
 * ZodValidationPipe — validates request bodies against a Zod schema.
 * Returns HTTP 400 with field-level details on failure.
 */
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const details = this.formatErrors(result.error);
      throw new BadRequestException({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details,
      });
    }
    return result.data;
  }

  private formatErrors(error: ZodError): Record<string, string>[] {
    return error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
}
