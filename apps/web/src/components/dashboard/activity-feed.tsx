'use client';

import { useGenerations } from '@/lib/hooks/use-generations';
import { GenerationStatus } from '@nexusui/shared';
import type { Generation } from '@nexusui/shared';
import { formatRelativeTime } from '@nexusui/shared';
import { CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';

const STATUS_ICONS = {
  [GenerationStatus.COMPLETED]: <CheckCircle size={13} className="text-[#14AE5C]" />,
  [GenerationStatus.FAILED]: <XCircle size={13} className="text-[#F24822]" />,
  [GenerationStatus.PROCESSING]: <Loader2 size={13} className="text-[#A259FF] animate-spin" />,
  [GenerationStatus.PENDING]: <Loader2 size={13} className="text-[#808080] animate-spin" />,
  [GenerationStatus.CANCELLED]: <XCircle size={13} className="text-[#808080]" />,
};

/** Recent activity feed showing last 5 generations */
export function ActivityFeed() {
  const { data, isLoading } = useGenerations({ limit: '5' });

  if (isLoading) {
    return (
      <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full skeleton" />
              <div className="flex-1 space-y-1">
                <div className="h-3 rounded skeleton w-3/4" />
                <div className="h-2.5 rounded skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = data?.data ?? [];

  return (
    <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
      <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Sparkles size={24} className="text-[#444444] mb-2" />
          <p className="text-sm text-[#808080]">No generations yet</p>
          <p className="text-xs text-[#666666] mt-1">Generate components from a project to see activity here</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((gen: Generation) => (
            <li key={gen.id} className="flex items-start gap-3">
              <div className="mt-0.5">{STATUS_ICONS[gen.status as GenerationStatus]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">{gen.prompt}</p>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  {gen.creditsCost} credits · {formatRelativeTime(gen.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
