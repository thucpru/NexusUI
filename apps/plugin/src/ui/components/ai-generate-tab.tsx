/**
 * ai-generate-tab.tsx
 * AI component generation — prompt + model selector + variant count + framework.
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { AIModelRef } from '@nexusui/shared';
import type { VariantPreview, GenerateFormState } from '../../types/figma-plugin-types';
import { fetchModels, generateComponents } from '../lib/api-client';
import type { GenerateRequest } from '../lib/api-client';
import { sendToCode } from '../lib/figma-api-bridge';
import { ModelSelector } from './model-selector';
import { VariantPreviewCard } from './variant-preview-card';

const FRAMEWORKS = ['react', 'vue', 'svelte', 'html'] as const;
type Framework = (typeof FRAMEWORKS)[number];

interface Props {
  token: string;
  projectId: string;
  designSystemId?: string;
}

export function AiGenerateTab({ token, projectId, designSystemId }: Props) {
  const [models, setModels] = useState<AIModelRef[]>([]);
  const [form, setForm] = useState<GenerateFormState>(() => {
    const initial: GenerateFormState = {
      prompt: '',
      modelId: '',
      variantCount: 1,
      framework: 'react',
      projectId,
    };
    if (designSystemId) initial.designSystemId = designSystemId;
    return initial;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<VariantPreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchModels(token)
      .then((data) => {
        setModels(data);
        if (data.length > 0 && !form.modelId) {
          setForm((f) => ({ ...f, modelId: data[0]?.id ?? '' }));
        }
      })
      .catch(() => setError('Failed to load models'));
  }, [token]);

  const selectedModel = models.find((m) => m.id === form.modelId);
  const estimatedCost = selectedModel
    ? selectedModel.creditCostPerRequest * form.variantCount
    : 0;

  async function handleGenerate(e: Event) {
    e.preventDefault();
    if (!form.prompt.trim() || !form.modelId) return;
    setIsGenerating(true);
    setError(null);
    setVariants([]);
    try {
      const genReq: GenerateRequest = {
        projectId: form.projectId,
        modelId: form.modelId,
        prompt: form.prompt,
        variantCount: form.variantCount,
        framework: form.framework,
      };
      if (form.designSystemId) genReq.designSystemId = form.designSystemId;
      const result = await generateComponents(token, genReq);
      setVariants(result.variants ?? []);
    } catch (err: unknown) {
      setError(err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleInsert(variant: VariantPreview) {
    // Parse code into a basic component node and send to canvas
    await sendToCode('RENDER_COMPONENT', {
      root: {
        type: 'FRAME',
        name: `Generated Component`,
        width: 320,
        height: 200,
        children: [],
      },
    });
  }

  function setField<K extends keyof GenerateFormState>(key: K, val: GenerateFormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div class="tab-content">
      <form class="generate-form" onSubmit={handleGenerate}>
        <label class="form-label">
          Prompt
          <textarea
            class="textarea"
            rows={3}
            placeholder="A settings form with dark mode toggle…"
            value={form.prompt}
            onInput={(e) => setField('prompt', (e.target as HTMLTextAreaElement).value)}
            disabled={isGenerating}
          />
        </label>

        <label class="form-label">
          Model
          <ModelSelector
            models={models}
            selectedId={form.modelId}
            onChange={(id) => setField('modelId', id)}
            disabled={isGenerating}
          />
        </label>

        <div class="form-row">
          <label class="form-label form-label--half">
            Variants
            <select
              class="select"
              value={form.variantCount}
              onChange={(e) =>
                setField('variantCount', Number((e.target as HTMLSelectElement).value))
              }
              disabled={isGenerating}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <label class="form-label form-label--half">
            Framework
            <select
              class="select"
              value={form.framework}
              onChange={(e) =>
                setField('framework', (e.target as HTMLSelectElement).value as Framework)
              }
              disabled={isGenerating}
            >
              {FRAMEWORKS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
        </div>

        {estimatedCost > 0 && (
          <p class="cost-estimate">
            Estimated cost: <strong>{estimatedCost} credits</strong>
          </p>
        )}

        {error && <p class="error-message">{error}</p>}

        <button
          type="submit"
          class="btn btn--primary btn--full"
          disabled={isGenerating || !form.prompt.trim() || !form.modelId}
        >
          {isGenerating ? <span class="shimmer-text">Generating…</span> : '✦ Generate'}
        </button>
      </form>

      {variants.length > 0 && (
        <div class="variants-list">
          <h3 class="section-title">Generated Variants</h3>
          {variants.map((v, i) => (
            <VariantPreviewCard key={v.id} variant={v} index={i} onInsert={handleInsert} />
          ))}
        </div>
      )}
    </div>
  );
}
