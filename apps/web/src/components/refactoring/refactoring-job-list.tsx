'use client';

import { useState } from 'react';
import type { RefactoringStatus } from '@nexusui/shared';
import { useRefactoringJobs } from '@/lib/hooks/use-refactoring';
import { RefactoringJobCard } from './refactoring-job-card';
import { ListFilter, ClipboardList } from 'lucide-react';

interface RefactoringJobListProps {
  projectId: string;
}

type StatusFilter = RefactoringStatus | 'ALL';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SCANNING', label: 'Scanning' },
  { value: 'ANALYZED', label: 'Analyzed' },
  { value: 'BEAUTIFYING', label: 'Beautifying' },
  { value: 'VALIDATING', label: 'Validating' },
  { value: 'PR_CREATED', label: 'PR Created' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
];

/** Filtered list of refactoring jobs with real-time polling via TanStack Query */
export function RefactoringJobList({ projectId }: RefactoringJobListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const params = statusFilter !== 'ALL' ? { status: statusFilter } : undefined;
  const { data, isLoading, error } = useRefactoringJobs(projectId, params);
  const jobs = data?.jobs ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg border border-[#383838] bg-[#2C2C2C] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-12 rounded-lg border border-[#383838] bg-[#2C2C2C]">
        <p className="text-sm text-[#F24822]">Failed to load jobs</p>
        <p className="text-xs text-[#666666] mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <ListFilter size={14} className="text-[#666666]" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className={[
            'h-8 px-2 rounded-md text-xs text-white bg-[#2C2C2C] border border-[#383838]',
            'focus:outline-none focus:border-[#0C8CE9] transition-colors',
          ].join(' ')}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {data && (
          <span className="text-xs text-[#666666]">{data.total} total</span>
        )}
      </div>

      {/* Job list */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center py-16 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <ClipboardList size={32} className="text-[#444444] mb-3" />
          <p className="text-sm text-[#B3B3B3]">No refactoring jobs</p>
          <p className="text-xs text-[#666666] mt-1">Beautify a component to start a job</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <RefactoringJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
