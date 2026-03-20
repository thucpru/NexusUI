'use client';

import { use } from 'react';
import Link from 'next/link';
import { RefactoringJobList } from '@/components/refactoring/refactoring-job-list';
import { ArrowLeft, ClipboardList } from 'lucide-react';

interface QueuePageProps {
  params: Promise<{ id: string }>;
}

/** Refactoring queue page — lists all jobs with real-time status polling */
export default function RefactoringQueuePage({ params }: QueuePageProps) {
  const { id } = use(params);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/projects/${id}/refactor`}
          className="flex items-center gap-1.5 text-xs text-[#808080] hover:text-white transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Audit
        </Link>
        <span className="text-[#444444]">/</span>
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-[#A259FF]" />
          <h1 className="text-base font-bold text-white">Refactoring Queue</h1>
        </div>
      </div>

      <p className="text-xs text-[#808080]">
        Live job queue — updates every 5 seconds. Completed jobs can be used to generate a PR.
      </p>

      <RefactoringJobList projectId={id} />
    </div>
  );
}
