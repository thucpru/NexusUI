'use client';

import { use } from 'react';
import Link from 'next/link';
import { useComponentAudit, useBeautifyComponent, useRefactoringJobs, useGeneratePr } from '@/lib/hooks/use-refactoring';
import { useAIModels } from '@/lib/hooks/use-ai-models';
import { useCreditBalance } from '@/lib/hooks/use-credit-balance';
import { BeforeAfterPreview } from '@/components/refactoring/before-after-preview';
import { CodeDiffViewer } from '@/components/refactoring/code-diff-viewer';
import { TokenMappingPanel } from '@/components/refactoring/token-mapping-panel';
import { LogicSafetyBadge } from '@/components/refactoring/logic-safety-badge';
import { BeautifyActionBar } from '@/components/refactoring/beautify-action-bar';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ComponentDetailPageProps {
  params: Promise<{ id: string; componentId: string }>;
}

/** Component detail page — before/after preview, diff, token mapping, beautify actions */
export default function ComponentDetailPage({ params }: ComponentDetailPageProps) {
  const { id: projectId, componentId } = use(params);
  const { data: component, isLoading, error } = useComponentAudit(projectId, componentId);
  const { data: jobsData } = useRefactoringJobs(projectId);
  const { data: models = [] } = useAIModels();
  const { data: creditData } = useCreditBalance();
  const { mutate: beautify, isPending: isBeautifying } = useBeautifyComponent();
  const { mutate: generatePr, isPending: isGeneratingPr } = useGeneratePr();

  // Most recent job for this component
  const latestJob = jobsData?.jobs.find((j) => j.componentPath === component?.filePath);
  const completedJobIds = (jobsData?.jobs ?? [])
    .filter((j) => j.status === 'COMPLETED' && j.componentPath === component?.filePath)
    .map((j) => j.id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-1/3 rounded skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-96 rounded-lg skeleton" />
          <div className="h-64 rounded-lg skeleton" />
        </div>
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <AlertTriangle size={28} className="text-[#F24822] mb-3" />
        <p className="text-sm text-white">Component not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/projects/${projectId}/refactor`}
          className="flex items-center gap-1.5 text-xs text-[#808080] hover:text-white transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Audit
        </Link>
        <span className="text-[#444444]">/</span>
        <h1 className="text-base font-bold text-white">{component.componentName}</h1>
        <LogicSafetyBadge safety={component.logicSafety} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main: Before/After + Diff */}
        <div className="lg:col-span-2 space-y-4">
          {latestJob?.beforeCode && latestJob.afterCode ? (
            <>
              <BeforeAfterPreview before={latestJob.beforeCode} after={latestJob.afterCode} />
              {latestJob.diffPreview && <CodeDiffViewer diff={latestJob.diffPreview} />}
            </>
          ) : (
            <div className="flex flex-col items-center py-16 rounded-lg border border-[#383838] bg-[#2C2C2C]">
              <p className="text-sm text-[#B3B3B3]">No preview available</p>
              <p className="text-xs text-[#666666] mt-1">Beautify this component to see a diff</p>
            </div>
          )}
        </div>

        {/* Sidebar: Token mapping */}
        <div className="space-y-4">
          {latestJob?.styleChanges ? (
            <TokenMappingPanel styleChanges={latestJob.styleChanges} />
          ) : (
            <div className="p-4 rounded-lg border border-[#383838] bg-[#2C2C2C]">
              <p className="text-xs text-[#666666]">Style changes will appear here after beautification</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <BeautifyActionBar
        projectId={projectId}
        componentPath={component.filePath}
        estimatedCredits={component.estimatedCredits}
        creditBalance={creditData?.balance ?? 0}
        aiModels={models}
        selectedJobIds={completedJobIds}
        onBeautify={(aiModelId) => beautify({ projectId, componentPath: component.filePath, aiModelId })}
        onGeneratePr={() => generatePr({ projectId, jobIds: completedJobIds })}
        isBeautifying={isBeautifying}
        isGeneratingPr={isGeneratingPr}
      />
    </div>
  );
}
