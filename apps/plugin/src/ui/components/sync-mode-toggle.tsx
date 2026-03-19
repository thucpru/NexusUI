/**
 * sync-mode-toggle.tsx
 * Toggle between "Create PR" (safe) and "Direct commit" (fast) sync mode.
 */

import { h } from 'preact';
import type { SyncMode } from '../../types/figma-plugin-types';

interface Props {
  mode: SyncMode;
  onChange: (mode: SyncMode) => void;
  disabled?: boolean;
}

export function SyncModeToggle({ mode, onChange, disabled }: Props) {
  return (
    <div class="sync-mode-toggle" role="group" aria-label="Sync mode">
      <button
        class={`sync-mode-toggle__btn ${mode === 'pr' ? 'sync-mode-toggle__btn--active' : ''}`}
        onClick={() => onChange('pr')}
        disabled={disabled}
        title="Creates a pull request — safe, reviewable"
      >
        Create PR
      </button>
      <button
        class={`sync-mode-toggle__btn ${mode === 'direct' ? 'sync-mode-toggle__btn--active' : ''}`}
        onClick={() => onChange('direct')}
        disabled={disabled}
        title="Commits directly to the selected branch"
      >
        Direct commit
      </button>
    </div>
  );
}
