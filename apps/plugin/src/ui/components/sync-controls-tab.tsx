/**
 * sync-controls-tab.tsx
 * GitHub sync controls — branch selector, sync mode toggle, push/pull, log.
 */

import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { SyncMode, SyncLogEntry as SyncLogEntryType } from '../../types/figma-plugin-types';
import { fetchBranches, syncGitHub } from '../lib/api-client';
import { sendToCode } from '../lib/figma-api-bridge';
import { BranchSelector } from './branch-selector';
import { SyncModeToggle } from './sync-mode-toggle';
import { SyncLogEntryItem } from './sync-log-entry';
import type { GitHubBranch } from '../lib/api-client';

interface Props {
  token: string;
  connectionId?: string;
}

export function SyncControlsTab({ token, connectionId }: Props) {
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [syncMode, setSyncMode] = useState<SyncMode>('pr');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [log, setLog] = useState<SyncLogEntryType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !connectionId) return;
    setIsLoadingBranches(true);
    fetchBranches(token, connectionId)
      .then((data) => {
        setBranches(data);
        if (data.length > 0) setSelectedBranch(data[0]?.name ?? 'main');
      })
      .catch(() => setError('Failed to load branches'))
      .finally(() => setIsLoadingBranches(false));
  }, [token, connectionId]);

  function addLogEntry(direction: 'push' | 'pull', message: string, status: SyncLogEntryType['status']) {
    setLog((prev) => [
      {
        id: `${Date.now()}`,
        timestamp: new Date(),
        direction,
        message,
        status,
      },
      ...prev.slice(0, 19), // keep last 20
    ]);
  }

  async function handleSync(direction: 'push' | 'pull') {
    if (!connectionId) return;
    setIsSyncing(true);
    setError(null);
    addLogEntry(direction, 'Starting…', 'pending');
    try {
      const result = await syncGitHub(token, {
        connectionId,
        direction,
        targetBranch: selectedBranch,
        syncMode,
      });

      addLogEntry(direction, result.message, 'success');

      // If pull, render component tree on canvas
      if (direction === 'pull' && result.status === 'success') {
        await sendToCode('RENDER_COMPONENT', {
          root: { type: 'FRAME', name: 'Pulled Components', width: 400, height: 300, children: [] },
        });
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Sync failed';
      addLogEntry(direction, msg, 'error');
      setError(msg);
    } finally {
      setIsSyncing(false);
    }
  }

  const noConnection = !connectionId;

  return (
    <div class="tab-content">
      {noConnection ? (
        <div class="empty-state">
          <p>No GitHub repository connected.</p>
          <p class="empty-state__hint">Connect a repo in your NexusUI project settings.</p>
        </div>
      ) : (
        <>
          <div class="sync-section">
            <label class="form-label">
              Target branch
              <BranchSelector
                branches={branches}
                selected={selectedBranch}
                onChange={setSelectedBranch}
                disabled={isSyncing}
                isLoading={isLoadingBranches}
              />
            </label>

            <label class="form-label">
              Sync mode
              <SyncModeToggle mode={syncMode} onChange={setSyncMode} disabled={isSyncing} />
            </label>
          </div>

          {error && <p class="error-message">{error}</p>}

          <div class="sync-actions">
            <button
              class="btn btn--primary btn--full"
              onClick={() => handleSync('push')}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing…' : '↑ Push design → code'}
            </button>
            <button
              class="btn btn--ghost btn--full"
              onClick={() => handleSync('pull')}
              disabled={isSyncing}
            >
              ↓ Pull code → canvas
            </button>
          </div>
        </>
      )}

      {log.length > 0 && (
        <div class="sync-log">
          <h3 class="section-title">Recent activity</h3>
          <ul class="sync-log__list">
            {log.map((entry) => (
              <SyncLogEntryItem key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
