/**
 * branch-selector.tsx
 * Dropdown for selecting target GitHub branch.
 */

import { h } from 'preact';
import type { GitHubBranch } from '../lib/api-client';

interface Props {
  branches: GitHubBranch[];
  selected: string;
  onChange: (branch: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function BranchSelector({ branches, selected, onChange, disabled, isLoading }: Props) {
  if (isLoading) {
    return <select class="select" disabled><option>Loading branches…</option></select>;
  }

  if (branches.length === 0) {
    return <select class="select" disabled><option>No branches available</option></select>;
  }

  return (
    <select
      class="select"
      value={selected}
      onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
      disabled={disabled}
    >
      {branches.map((b) => (
        <option key={b.name} value={b.name}>
          {b.protected ? '🔒 ' : ''}{b.name}
        </option>
      ))}
    </select>
  );
}
