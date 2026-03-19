/**
 * OutputParserService — parses raw AI text response into structured JSON.
 * Handles cases where the model wraps output in markdown code fences.
 * Validates output structure and throws on malformed responses.
 */
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

/** Validated shape of a single generated component */
const ComponentSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  code: z.string().min(1),
  language: z.enum(['typescript', 'javascript']).default('typescript'),
  figmaNodes: z.array(z.unknown()).default([]),
});

/** Full generation output schema */
const GenerationOutputSchema = z.object({
  components: z.array(ComponentSchema).min(1),
  styles: z.object({
    tokens: z.record(z.unknown()).default({}),
    overrides: z.record(z.unknown()).default({}),
  }).default({ tokens: {}, overrides: {} }),
  layout: z.object({
    type: z.string().default('flex'),
    direction: z.string().default('column'),
    gap: z.string().default('0'),
  }).default({ type: 'flex', direction: 'column', gap: '0' }),
});

export type ParsedGenerationOutput = z.infer<typeof GenerationOutputSchema>;

@Injectable()
export class OutputParserService {
  private readonly logger = new Logger(OutputParserService.name);

  /** Parse AI response text → validated structured output */
  parse(rawContent: string): ParsedGenerationOutput {
    const jsonString = this.extractJson(rawContent);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      this.logger.warn('JSON parse failed — content was not valid JSON');
      throw new Error(`AI response could not be parsed as JSON: ${(err as Error).message}`);
    }

    const result = GenerationOutputSchema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      this.logger.warn(`Output schema validation failed: ${issues}`);
      throw new Error(`AI response schema invalid: ${issues}`);
    }

    return result.data;
  }

  /** Strip markdown code fences (```json ... ```) if present */
  private extractJson(raw: string): string {
    const trimmed = raw.trim();

    // Match ```json ... ``` or ``` ... ```
    const fenceMatch = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(trimmed);
    if (fenceMatch?.[1]) {
      return fenceMatch[1].trim();
    }

    // Try to extract first {...} block
    const braceStart = trimmed.indexOf('{');
    const braceEnd = trimmed.lastIndexOf('}');
    if (braceStart !== -1 && braceEnd > braceStart) {
      return trimmed.slice(braceStart, braceEnd + 1);
    }

    return trimmed;
  }
}
