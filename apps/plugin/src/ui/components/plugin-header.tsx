/**
 * plugin-header.tsx
 * Tab navigation header — Design System / AI Generate / Sync
 */

import { h } from 'preact';
import type { TabId } from '../../types/figma-plugin-types';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasUnsavedChanges?: boolean;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'design-system', label: 'Design System' },
  { id: 'ai-generate', label: 'AI Generate' },
  { id: 'sync', label: 'Sync' },
];

export function PluginHeader({ activeTab, onTabChange, hasUnsavedChanges }: Props) {
  return (
    <header class="plugin-header">
      <div class="plugin-header__brand">
        <span class="plugin-header__logo">N</span>
        <span class="plugin-header__title">NexusUI</span>
      </div>
      <nav class="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            class={`tab-bar__tab ${activeTab === tab.id ? 'tab-bar__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.id === 'design-system' && hasUnsavedChanges && (
              <span class="tab-bar__dot" aria-label="Unsaved changes" />
            )}
          </button>
        ))}
      </nav>
    </header>
  );
}
