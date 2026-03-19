/**
 * app.tsx
 * Root Preact component — orchestrates auth, tabs, and canvas change detection.
 */

import { h } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import type {
  TabId,
  CanvasChange,
  PluginMessage,
  DesignSystemTokenSet,
} from '../types/figma-plugin-types';
import { buildCanvasChanges, createChangeDebounder } from './lib/canvas-change-detector';
import { saveDesignSystem } from './lib/api-client';
import { useAuth } from './hooks/use-auth';
import { useFigmaMessage } from './hooks/use-figma-message';
import { AuthScreen } from './components/auth-screen';
import { PluginHeader } from './components/plugin-header';
import { DesignSystemTab } from './components/design-system-tab';
import { AiGenerateTab } from './components/ai-generate-tab';
import { SyncControlsTab } from './components/sync-controls-tab';
import { CreditBalanceFooter } from './components/credit-balance-footer';

// TODO: derive projectId + designSystemId + connectionId from API after auth
const PLACEHOLDER_PROJECT_ID = '';

export function App() {
  const { token, isLoading: authLoading, saveToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('design-system');
  const [pendingChanges, setPendingChanges] = useState<CanvasChange[]>([]);

  // Debounced canvas change handler
  const flushChanges = useCallback((changes: CanvasChange[]) => {
    setPendingChanges((prev) => {
      // Deduplicate by nodeId+property
      const existing = new Set(prev.map((c) => `${c.nodeId}:${c.property}`));
      const newChanges = changes.filter((c) => !existing.has(`${c.nodeId}:${c.property}`));
      return [...prev, ...newChanges];
    });
  }, []);

  const debouncedHandler = createChangeDebounder(flushChanges, 500);

  // Handle messages from Figma code sandbox
  const handleMessage = useCallback(
    (msg: PluginMessage) => {
      if (msg.type === 'CANVAS_CHANGED') {
        const payload = msg.payload as { rawChanges: unknown[] };
        const changes = buildCanvasChanges(payload.rawChanges as Parameters<typeof buildCanvasChanges>[0]);
        debouncedHandler(changes);
      }
    },
    [debouncedHandler],
  );

  useFigmaMessage(handleMessage);

  async function handleSyncTokens(tokens: DesignSystemTokenSet) {
    if (!token) return;
    await saveDesignSystem(token, PLACEHOLDER_PROJECT_ID, undefined, tokens);
  }

  if (authLoading) {
    return (
      <div class="loading-screen">
        <div class="spinner" />
      </div>
    );
  }

  if (!token) {
    return (
      <div class="plugin-root">
        <AuthScreen onSave={saveToken} />
      </div>
    );
  }

  return (
    <div class="plugin-root">
      <PluginHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasUnsavedChanges={pendingChanges.length > 0}
      />

      <main class="plugin-main">
        {activeTab === 'design-system' && (
          <DesignSystemTab
            token={token}
            pendingChanges={pendingChanges}
            onClearChanges={() => setPendingChanges([])}
            onSyncTokens={handleSyncTokens}
          />
        )}
        {activeTab === 'ai-generate' && (
          <AiGenerateTab
            token={token}
            projectId={PLACEHOLDER_PROJECT_ID}
          />
        )}
        {activeTab === 'sync' && (
          <SyncControlsTab token={token} />
        )}
      </main>

      <CreditBalanceFooter token={token} />
    </div>
  );
}
