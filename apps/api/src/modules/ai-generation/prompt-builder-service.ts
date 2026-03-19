/**
 * PromptBuilderService — assembles system prompt + user prompt for AI generation.
 * Includes design system tokens as constraints. Output format is standardized JSON.
 * Same structure for all providers — normalization happens here, not per-provider.
 */
import { Injectable } from '@nestjs/common';
import type { DesignSystemSnapshot } from './design-system-context-builder';
import { DesignSystemContextBuilder } from './design-system-context-builder';

export type Framework = 'react' | 'vue' | 'svelte' | 'html';

const FRAMEWORK_INSTRUCTIONS: Record<Framework, string> = {
  react: 'Generate TypeScript React components using functional components and hooks. Use Tailwind CSS for styling where applicable.',
  vue: 'Generate Vue 3 components using <script setup> with TypeScript. Use Tailwind CSS for styling where applicable.',
  svelte: 'Generate Svelte 5 components with TypeScript. Use Tailwind CSS for styling where applicable.',
  html: 'Generate plain HTML with inline styles or a <style> block. No framework dependencies.',
};

const OUTPUT_FORMAT_SPEC = `
## Required Output Format
Respond with a JSON object matching this exact structure (no markdown fences):
{
  "components": [
    {
      "name": "ComponentName",
      "description": "Brief description",
      "code": "// complete component code here",
      "language": "typescript",
      "figmaNodes": []
    }
  ],
  "styles": {
    "tokens": {},
    "overrides": {}
  },
  "layout": {
    "type": "flex | grid | stack | absolute",
    "direction": "row | column",
    "gap": "spacing value"
  }
}
`.trim();

@Injectable()
export class PromptBuilderService {
  constructor(private readonly dsContextBuilder: DesignSystemContextBuilder) {}

  /** Build system prompt with design system constraints and output format */
  buildSystemPrompt(snapshot: DesignSystemSnapshot, framework: Framework): string {
    const dsText = this.dsContextBuilder.snapshotToPromptText(snapshot);
    const frameworkInstruction = FRAMEWORK_INSTRUCTIONS[framework];

    return [
      '# NexusUI Component Generator',
      '',
      'You are an expert UI component generator. Your task is to create production-ready UI components based on user prompts, strictly adhering to the provided design system tokens.',
      '',
      '## Framework',
      frameworkInstruction,
      '',
      dsText,
      '',
      '## Constraints',
      '- Use ONLY the color, spacing, and typography tokens provided above.',
      '- Do NOT introduce arbitrary values not present in the design system.',
      '- Components must be accessible (ARIA attributes where appropriate).',
      '- Code must be complete and immediately usable — no placeholders.',
      '',
      OUTPUT_FORMAT_SPEC,
    ].join('\n');
  }

  /** Build the user-facing prompt, appending variant count context */
  buildUserPrompt(userPrompt: string, variantCount: number): string {
    if (variantCount > 1) {
      return `${userPrompt}\n\nGenerate ${variantCount} distinct variants of this component. Each variant should be in a separate entry in the "components" array with a different design approach.`;
    }
    return userPrompt;
  }
}
