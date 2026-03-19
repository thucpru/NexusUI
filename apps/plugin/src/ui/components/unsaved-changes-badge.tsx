/**
 * unsaved-changes-badge.tsx
 * Badge shown when canvas changes are pending confirmation.
 */

import { h } from 'preact';
import type { CanvasChange } from '../../types/figma-plugin-types';
import { countByCategory } from '../lib/canvas-change-detector';

interface Props {
  changes: CanvasChange[];
  onApply: () => void;
  onDismiss: () => void;
}

export function UnsavedChangesBadge({ changes, onApply, onDismiss }: Props) {
  if (changes.length === 0) return null;

  const counts = countByCategory(changes);
  const summary = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([cat, count]) => `${count} ${cat}`)
    .join(', ');

  return (
    <div class="unsaved-badge">
      <span class="unsaved-badge__icon">●</span>
      <div class="unsaved-badge__content">
        <span class="unsaved-badge__label">Unsaved changes</span>
        <span class="unsaved-badge__summary">{summary}</span>
      </div>
      <div class="unsaved-badge__actions">
        <button class="btn btn--primary btn--xs" onClick={onApply}>
          Apply
        </button>
        <button class="btn btn--ghost btn--xs" onClick={onDismiss}>
          ✕
        </button>
      </div>
    </div>
  );
}
