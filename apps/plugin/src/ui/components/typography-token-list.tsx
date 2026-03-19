/**
 * typography-token-list.tsx
 * Renders list of typography tokens.
 */

import { h } from 'preact';
import type { TypographyToken } from '../../types/figma-plugin-types';

interface Props {
  tokens: TypographyToken[];
}

export function TypographyTokenList({ tokens }: Props) {
  if (tokens.length === 0) {
    return <p class="empty-state">No typography tokens found.</p>;
  }

  return (
    <ul class="token-list">
      {tokens.map((token) => (
        <li key={token.name} class="token-list__item token-list__item--column">
          <span class="token-list__name">{token.name}</span>
          <span
            class="token-list__preview"
            style={{
              fontFamily: token.fontFamily,
              fontSize: `${token.fontSize}px`,
              fontWeight: token.fontWeight,
              lineHeight: `${token.lineHeight}px`,
            }}
          >
            Aa
          </span>
          <span class="token-list__meta">
            {token.fontFamily} · {token.fontSize}px · {token.fontWeight}w ·{' '}
            {token.lineHeight}lh
          </span>
        </li>
      ))}
    </ul>
  );
}
