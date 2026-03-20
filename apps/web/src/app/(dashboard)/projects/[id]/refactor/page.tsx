'use client';

import { use } from 'react';
import Link from 'next/link';
import { useComponentAudits } from '@/lib/hooks/use-refactoring';
import { ScanTriggerButton } from '@/components/refactoring/scan-trigger-button';
import { ComponentAuditGrid } from '@/components/refactoring/component-audit-grid';
import { AlertTriangle, GitPullRequestArrow, ScanLine } from 'lucide-react';

interface RefactorPageProps {
  params: Promise<{ id: string }>;
}

/** Component audit page — scan, browse and batch-beautify project components */
export default function RefactorPage({ params }: RefactorPageProps) {
  const { id } = use(params);
  const { data, isLoading, error } = useComponentAudits(id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white">UI Refactor</h1>
          <p className="text-xs text-[#808080] mt-0.5">
            Scan, analyze, and beautify components using design tokens
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/projects/${id}/refactor/queue`}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-[#383838] text-xs text-[#B3B3B3] hover:bg-[#383838] hover:text-white transition-colors duration-150"
          >
            <GitPullRequestArrow size={13} />
            View Queue
          </Link>
          <ScanTriggerButton projectId={id} />
        </div>
      </div>

      {/* Summary stats */}
      {data && (
        <div className="flex items-center gap-4 p-3 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{data.totalComponents}</p>
            <p className="text-[11px] text-[#666666]">Components</p>
          </div>
          <div className="w-px h-8 bg-[#383838]" />
          <div className="text-center">
            <p className="text-lg font-bold text-[#F5A623]">{data.totalIssues}</p>
            <p className="text-[11px] text-[#666666]">Total Issues</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          <div className="h-8 w-1/2 rounded skeleton" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-lg skeleton" />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center py-20 text-center">
          <AlertTriangle size={28} className="text-[#F24822] mb-3" />
          <p className="text-sm text-white">Failed to load components</p>
          <p className="text-xs text-[#808080] mt-1">{(error as Error).message}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && data?.components.length === 0 && (
        <div className="flex flex-col items-center py-20 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <ScanLine size={32} className="text-[#444444] mb-3" />
          <p className="text-sm text-[#B3B3B3]">No components scanned yet</p>
          <p className="text-xs text-[#666666] mt-1">Click &quot;Scan Components&quot; to analyze this project</p>
        </div>
      )}

      {/* Component grid */}
      {!isLoading && !error && data && data.components.length > 0 && (
        <ComponentAuditGrid components={data.components} projectId={id} />
      )}
    </div>
  );
}
