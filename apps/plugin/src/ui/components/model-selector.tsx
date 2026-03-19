/**
 * model-selector.tsx
 * Dropdown showing available AI models with credit cost per request.
 */

import { h } from 'preact';
import type { AIModelRef } from '@nexusui/shared';

interface Props {
  models: AIModelRef[];
  selectedId: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ models, selectedId, onChange, disabled }: Props) {
  if (models.length === 0) {
    return <select class="select" disabled><option>Loading models…</option></select>;
  }

  return (
    <select
      class="select"
      value={selectedId}
      onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
      disabled={disabled}
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.displayName} — {model.creditCostPerRequest} credits
        </option>
      ))}
    </select>
  );
}
