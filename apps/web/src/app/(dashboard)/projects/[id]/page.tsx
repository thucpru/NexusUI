'use client';

import { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProject } from '@/lib/hooks/use-projects';
import { ProjectHeader } from '@/components/project/project-header';
import { SyncStatusIndicator } from '@/components/project/sync-status-indicator';
import { DesignSystemPreview } from '@/components/project/design-system-preview';
import { GenerationHistoryList } from '@/components/project/generation-history-list';
import { AlertTriangle, LayoutDashboard, Wand2 } from 'lucide-react';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

/** Project detail page — design system, sync, and generation history */
export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { data: project, isLoading, error } = useProject(id);
  const pathname = usePathname();

  const tabs = [
    { label: 'Overview', href: `/projects/${id}`, icon: LayoutDashboard },
    { label: 'UI Refactor', href: `/projects/${id}/refactor`, icon: Wand2 },
  ];

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

      {/* Project tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-[#383838]">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive = href === `/projects/${id}` ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                'inline-flex items-center gap-1.5 px-3 h-9 text-xs font-medium border-b-2 -mb-px transition-colors duration-150',
                isActive
                  ? 'border-[#0C8CE9] text-white'
                  : 'border-transparent text-[#808080] hover:text-[#B3B3B3]',
              ].join(' ')}
            >
              <Icon size={13} className={isActive ? 'text-[#0C8CE9]' : ''} />
              {label}
            </Link>
          );
        })}
      </div>

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
