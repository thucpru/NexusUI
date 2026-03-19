/**
 * design-system-tab.tsx
 * Design tokens editor — colors, typography, spacing.
 * Includes unsaved-changes badge for canvas-detected changes.
 */

import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import { sendToCode } from '../lib/figma-api-bridge';
import type {
  DesignSystemTokenSet,
  CanvasChange,
  ColorToken,
} from '../../types/figma-plugin-types';
import { ColorTokenList } from './color-token-list';
import { TypographyTokenList } from './typography-token-list';
import { SpacingTokenList } from './spacing-token-list';
import { UnsavedChangesBadge } from './unsaved-changes-badge';

type TokenSection = 'colors' | 'typography' | 'spacing';

interface Props {
  token: string;
  pendingChanges: CanvasChange[];
  onClearChanges: () => void;
  onSyncTokens: (tokens: DesignSystemTokenSet) => Promise<void>;
}

const EMPTY_TOKENS: DesignSystemTokenSet = {
  colors: [],
  typography: [],
  spacing: [],
};

export function DesignSystemTab({ token, pendingChanges, onClearChanges, onSyncTokens }: Props) {
  const [tokens, setTokens] = useState<DesignSystemTokenSet>(EMPTY_TOKENS);
  const [section, setSection] = useState<TokenSection>('colors');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await sendToCode<undefined, { tokens: DesignSystemTokenSet }>('EXTRACT_TOKENS');
      setTokens(result.tokens);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to extract tokens');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extract on mount
  useEffect(() => {
    if (token) extractTokens();
  }, [token, extractTokens]);

  async function handleApplyChanges() {
    // Re-extract tokens to pick up canvas changes
    await extractTokens();
    onClearChanges();
  }

  async function handleExport() {
    setIsSyncing(true);
    try {
      await onSyncTokens(tokens);
    } finally {
      setIsSyncing(false);
    }
  }

  function handleEditColor(index: number, updated: ColorToken) {
    setTokens((prev) => {
      const colors = [...prev.colors];
      colors[index] = updated;
      return { ...prev, colors };
    });
  }

  const sectionCount = {
    colors: tokens.colors.length,
    typography: tokens.typography.length,
    spacing: tokens.spacing.length,
  };

  return (
    <div class="tab-content">
      <UnsavedChangesBadge
        changes={pendingChanges}
        onApply={handleApplyChanges}
        onDismiss={onClearChanges}
      />

      <div class="tab-content__toolbar">
        <button class="btn btn--ghost btn--sm" onClick={extractTokens} disabled={isLoading}>
          {isLoading ? 'Extracting…' : '↻ Extract from file'}
        </button>
        <button
          class="btn btn--primary btn--sm"
          onClick={handleExport}
          disabled={isSyncing || tokens.colors.length === 0}
        >
          {isSyncing ? 'Saving…' : '↑ Save to API'}
        </button>
      </div>

      {error && <p class="error-message">{error}</p>}

      <div class="section-tabs">
        {(['colors', 'typography', 'spacing'] as TokenSection[]).map((s) => (
          <button
            key={s}
            class={`section-tab ${section === s ? 'section-tab--active' : ''}`}
            onClick={() => setSection(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span class="section-tab__count">{sectionCount[s]}</span>
          </button>
        ))}
      </div>

      <div class="tab-content__body">
        {section === 'colors' && (
          <ColorTokenList tokens={tokens.colors} onEdit={handleEditColor} />
        )}
        {section === 'typography' && <TypographyTokenList tokens={tokens.typography} />}
        {section === 'spacing' && <SpacingTokenList tokens={tokens.spacing} />}
      </div>
    </div>
  );
}
