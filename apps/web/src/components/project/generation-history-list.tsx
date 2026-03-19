'use client';

import { useGenerations } from '@/lib/hooks/use-generations';
import { GenerationStatus } from '@nexusui/shared';
import type { Generation } from '@nexusui/shared';
import { formatRelativeTime } from '@nexusui/shared';
import { CheckCircle, XCircle, Loader2, Sparkles, Code2 } from 'lucide-react';

interface GenerationHistoryListProps {
  projectId: string;
}

const STATUS_ICON = {
  [GenerationStatus.COMPLETED]: <CheckCircle size={13} className="text-[#14AE5C]" />,
  [GenerationStatus.FAILED]: <XCircle size={13} className="text-[#F24822]" />,
  [GenerationStatus.PROCESSING]: <Loader2 size={13} className="text-[#A259FF] animate-spin" />,
  [GenerationStatus.PENDING]: <Loader2 size={13} className="text-[#808080] animate-spin" />,
  [GenerationStatus.CANCELLED]: <XCircle size={13} className="text-[#808080]" />,
};

/** Ordered list of AI generation jobs for a project */
export function GenerationHistoryList({ projectId }: GenerationHistoryListProps) {
  const { data, isLoading } = useGenerations({ projectId });
  const items = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-[#2C2C2C] border border-[#383838]">
            <div className="w-5 h-5 rounded-full skeleton" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-2/3 rounded skeleton" />
              <div className="h-2.5 w-1/3 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 rounded-lg border border-[#383838] bg-[#2C2C2C]">
        <Sparkles size={28} className="text-[#444444] mb-3" />
        <p className="text-sm text-[#B3B3B3]">No generations yet</p>
        <p className="text-xs text-[#666666] mt-1">Generate your first component from this project</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((gen: Generation) => (
        <div
          key={gen.id}
          className="flex items-start gap-3 p-4 rounded-lg border border-[#383838] bg-[#2C2C2C] hover:border-[#4D4D4D] transition-colors duration-150"
        >
          <div className="mt-0.5">{STATUS_ICON[gen.status as GenerationStatus]}</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{gen.prompt}</p>
            <div className="flex items-center gap-3 mt-1">
              {gen.output?.framework && (
                <span className="flex items-center gap-1 text-[11px] text-[#808080]">
                  <Code2 size={11} />
                  {gen.output.framework}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-[#A259FF]">
                <Sparkles size={11} />
                {gen.creditsCost} credits
              </span>
              <span className="text-[11px] text-[#666666]">
                {formatRelativeTime(gen.createdAt)}
              </span>
            </div>
          </div>

          {gen.status === GenerationStatus.COMPLETED && gen.output && (
            <button className="shrink-0 h-7 px-3 rounded bg-[rgba(12,140,233,0.12)] text-[#0C8CE9] text-xs hover:bg-[rgba(12,140,233,0.2)] transition-colors duration-150">
              View
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
