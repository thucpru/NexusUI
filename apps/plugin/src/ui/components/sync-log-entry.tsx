/**
 * sync-log-entry.tsx
 * Single entry in the sync activity log.
 */

import { h } from 'preact';
import type { SyncLogEntry } from '../../types/figma-plugin-types';

interface Props {
  entry: SyncLogEntry;
}

const STATUS_ICONS: Record<SyncLogEntry['status'], string> = {
  success: '✓',
  error: '✕',
  pending: '…',
};

const DIRECTION_LABELS: Record<SyncLogEntry['direction'], string> = {
  push: '↑ Push',
  pull: '↓ Pull',
};

export function SyncLogEntryItem({ entry }: Props) {
  const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <li class={`sync-log-entry sync-log-entry--${entry.status}`}>
      <span class="sync-log-entry__icon" aria-label={entry.status}>
        {STATUS_ICONS[entry.status]}
      </span>
      <div class="sync-log-entry__body">
        <span class="sync-log-entry__direction">{DIRECTION_LABELS[entry.direction]}</span>
        <span class="sync-log-entry__message">{entry.message}</span>
      </div>
      <span class="sync-log-entry__time">{timeStr}</span>
    </li>
  );
}
