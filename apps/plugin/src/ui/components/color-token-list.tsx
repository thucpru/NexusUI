/**
 * color-token-list.tsx
 * Renders list of color tokens with swatch and hex value.
 */

import { h } from 'preact';
import type { ColorToken } from '../../types/figma-plugin-types';

interface Props {
  tokens: ColorToken[];
  onEdit?: (index: number, updated: ColorToken) => void;
}

export function ColorTokenList({ tokens, onEdit }: Props) {
  if (tokens.length === 0) {
    return <p class="empty-state">No color tokens found.</p>;
  }

  return (
    <ul class="token-list">
      {tokens.map((token, i) => (
        <li key={token.name} class="token-list__item">
          <span
            class="token-list__swatch"
            style={{ background: token.value }}
            title={token.value}
          />
          <span class="token-list__name">{token.name}</span>
          <span class="token-list__value">{token.value}</span>
          {onEdit && (
            <button
              class="btn btn--ghost btn--xs"
              onClick={() => {
                const newVal = prompt(`Edit color "${token.name}":`, token.value);
                if (newVal && newVal !== token.value) {
                  onEdit(i, { ...token, value: newVal.trim() });
                }
              }}
            >
              Edit
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
