/**
 * spacing-token-list.tsx
 * Renders spacing tokens as visual bars.
 */

import { h } from 'preact';
import type { SpacingToken } from '../../types/figma-plugin-types';

interface Props {
  tokens: SpacingToken[];
}

export function SpacingTokenList({ tokens }: Props) {
  if (tokens.length === 0) {
    return <p class="empty-state">No spacing tokens found.</p>;
  }

  const max = Math.max(...tokens.map((t) => t.value), 1);

  return (
    <ul class="token-list">
      {tokens.map((token) => (
        <li key={token.name} class="token-list__item">
          <span class="token-list__name">{token.name}</span>
          <span
            class="token-list__spacing-bar"
            style={{ width: `${(token.value / max) * 80}px` }}
            title={`${token.value}px`}
          />
          <span class="token-list__value">{token.value}px</span>
        </li>
      ))}
    </ul>
  );
}
