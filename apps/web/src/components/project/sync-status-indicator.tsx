import { SyncStatus } from '@nexusui/shared';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, GitBranch } from 'lucide-react';
import type { SyncEvent } from '@nexusui/shared';

interface SyncStatusIndicatorProps {
  syncEvent?: SyncEvent;
  repoId?: string;
}

const STATUS_CONFIG: Record<SyncStatus, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}> = {
  [SyncStatus.SUCCESS]: {
    icon: CheckCircle,
    label: 'Synced',
    color: 'text-[#14AE5C]',
    bg: 'bg-[rgba(20,174,92,0.12)]',
  },
  [SyncStatus.IDLE]: {
    icon: RefreshCw,
    label: 'Idle',
    color: 'text-[#808080]',
    bg: 'bg-[rgba(128,128,128,0.12)]',
  },
  [SyncStatus.SYNCING]: {
    icon: RefreshCw,
    label: 'Syncing...',
    color: 'text-[#0C8CE9]',
    bg: 'bg-[rgba(12,140,233,0.12)]',
  },
  [SyncStatus.FAILED]: {
    icon: XCircle,
    label: 'Sync failed',
    color: 'text-[#F24822]',
    bg: 'bg-[rgba(242,72,34,0.12)]',
  },
  [SyncStatus.CONFLICT]: {
    icon: AlertTriangle,
    label: 'Conflict',
    color: 'text-[#F2994A]',
    bg: 'bg-[rgba(242,153,74,0.12)]',
  },
};

/** GitHub sync status badge */
export function SyncStatusIndicator({ syncEvent, repoId }: SyncStatusIndicatorProps) {
  if (!repoId) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#808080]">
        <GitBranch size={13} />
        <span>No GitHub repo connected</span>
      </div>
    );
  }

  const status = syncEvent?.status ?? SyncStatus.IDLE;
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const isSpinning = status === SyncStatus.SYNCING;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} className={isSpinning ? 'animate-spin' : ''} />
      {cfg.label}
    </div>
  );
}
