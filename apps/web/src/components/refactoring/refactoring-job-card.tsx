import type { RefactoringJobDto, RefactoringStatus } from '@nexusui/shared';
import { formatRelativeTime } from '@nexusui/shared';
import { FileCode2, ExternalLink, Zap } from 'lucide-react';

interface RefactoringJobCardProps {
  job: RefactoringJobDto;
}

const STATUS_CONFIG: Record<RefactoringStatus, { label: string; color: string; bg: string }> = {
  PENDING:     { label: 'Pending',    color: 'text-[#808080]', bg: 'bg-[rgba(128,128,128,0.12)]' },
  SCANNING:    { label: 'Scanning',   color: 'text-[#0C8CE9]', bg: 'bg-[rgba(12,140,233,0.12)]' },
  ANALYZED:    { label: 'Analyzed',   color: 'text-[#F5A623]', bg: 'bg-[rgba(245,166,35,0.12)]' },
  BEAUTIFYING: { label: 'Beautifying', color: 'text-[#0C8CE9]', bg: 'bg-[rgba(12,140,233,0.12)]' },
  VALIDATING:  { label: 'Validating', color: 'text-[#F5A623]', bg: 'bg-[rgba(245,166,35,0.12)]' },
  PR_CREATED:  { label: 'PR Created', color: 'text-[#A259FF]', bg: 'bg-[rgba(162,89,255,0.12)]' },
  COMPLETED:   { label: 'Completed',  color: 'text-[#14AE5C]', bg: 'bg-[rgba(20,174,92,0.12)]' },
  FAILED:      { label: 'Failed',     color: 'text-[#F24822]', bg: 'bg-[rgba(242,72,34,0.12)]' },
};

/** Job queue card showing component, status, credits used, and PR link */
export function RefactoringJobCard({ job }: RefactoringJobCardProps) {
  const status = STATUS_CONFIG[job.status];

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-[#383838] bg-[#2C2C2C] hover:border-[#4D4D4D] transition-colors duration-150">
      <div className="w-8 h-8 rounded-md bg-[rgba(162,89,255,0.12)] flex items-center justify-center shrink-0">
        <FileCode2 size={15} className="text-[#A259FF]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-white truncate">{job.componentName}</p>
          <span className={[
            'shrink-0 inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium',
            status.color, status.bg,
          ].join(' ')}>
            {status.label}
          </span>
        </div>

        <p className="text-[11px] text-[#666666] truncate mb-2">{job.componentPath}</p>

        <div className="flex items-center gap-3 text-[11px] text-[#808080]">
          {job.creditsUsed > 0 && (
            <span className="flex items-center gap-1 text-[#A259FF]">
              <Zap size={10} />
              {job.creditsUsed} credits used
            </span>
          )}
          <span>{formatRelativeTime(job.createdAt)}</span>

          {job.githubPrUrl && (
            <a
              href={job.githubPrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#0C8CE9] hover:text-[#0D99FF] transition-colors"
            >
              <ExternalLink size={10} />
              View PR
            </a>
          )}
        </div>

        {job.errorMessage && (
          <p className="mt-2 text-[11px] text-[#F24822] bg-[rgba(242,72,34,0.08)] px-2 py-1 rounded">
            {job.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
