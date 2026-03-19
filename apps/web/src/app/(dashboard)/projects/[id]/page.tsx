'use client';

import { use } from 'react';
import { useProject } from '@/lib/hooks/use-projects';
import { ProjectHeader } from '@/components/project/project-header';
import { SyncStatusIndicator } from '@/components/project/sync-status-indicator';
import { DesignSystemPreview } from '@/components/project/design-system-preview';
import { GenerationHistoryList } from '@/components/project/generation-history-list';
import { AlertTriangle } from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

/** Project detail page — design system, sync, and generation history */
export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-16 rounded-lg skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 rounded-lg skeleton" />
          <div className="h-44 rounded-lg skeleton" />
        </div>
        <div className="h-64 rounded-lg skeleton" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <AlertTriangle size={32} className="text-[#F24822] mb-3" />
        <p className="text-sm text-white">Project not found</p>
        <p className="text-xs text-[#808080] mt-1">This project may have been deleted or you lack access.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProjectHeader project={project} />

      {/* Sync status */}
      <div className="mb-4 flex items-center gap-2">
        {project.githubRepoId
          ? <SyncStatusIndicator repoId={project.githubRepoId} />
          : <SyncStatusIndicator />
        }
      </div>

      {/* Design system + info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DesignSystemPreview designSystem={null} />

        {/* Project info card */}
        <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <h3 className="text-sm font-semibold text-white mb-4">Project Info</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#808080] shrink-0">Status</dt>
              <dd className="text-white font-medium">{project.status}</dd>
            </div>
            {project.figmaFileKey && (
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#808080] shrink-0">Figma File</dt>
                <dd className="text-white font-mono text-xs truncate max-w-[160px]">
                  {project.figmaFileKey}
                </dd>
              </div>
            )}
            {project.githubRepoId && (
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#808080] shrink-0">GitHub Repo</dt>
                <dd className="text-white font-mono text-xs truncate max-w-[160px]">
                  {project.githubRepoId}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Generation history */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Generation History</h2>
        <GenerationHistoryList projectId={id} />
      </div>
    </div>
  );
}
