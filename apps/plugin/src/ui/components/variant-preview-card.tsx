/**
 * variant-preview-card.tsx
 * Shows a generated component variant with code preview and insert button.
 */

import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { VariantPreview } from '../../types/figma-plugin-types';

interface Props {
  variant: VariantPreview;
  index: number;
  onInsert: (variant: VariantPreview) => void;
}

export function VariantPreviewCard({ variant, index, onInsert }: Props) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div class="variant-card">
      <div class="variant-card__header">
        <span class="variant-card__label">Variant {index + 1}</span>
        <span class="variant-card__framework">{variant.framework}</span>
      </div>
      {variant.previewImageUrl ? (
        <img
          class="variant-card__preview"
          src={variant.previewImageUrl}
          alt={`Variant ${index + 1} preview`}
        />
      ) : (
        <div class="variant-card__no-preview">No preview</div>
      )}
      <div class="variant-card__actions">
        <button class="btn btn--ghost btn--sm" onClick={() => setShowCode((s) => !s)}>
          {showCode ? 'Hide code' : 'View code'}
        </button>
        <button class="btn btn--primary btn--sm" onClick={() => onInsert(variant)}>
          Insert to canvas
        </button>
      </div>
      {showCode && (
        <pre class="variant-card__code">
          <code>{variant.code}</code>
        </pre>
      )}
    </div>
  );
}
