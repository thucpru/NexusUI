import type { Project } from '@nexusui/shared';
import { ProjectStatus } from '@nexusui/shared';
import { formatDateTime } from '@nexusui/shared';
import { FolderKanban, GitBranch, Sparkles, Archive, MoreHorizontal } from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
}

const STATUS_CONFIG = {
  [ProjectStatus.ACTIVE]: { label: 'Active', bg: 'bg-[rgba(20,174,92,0.12)]', color: 'text-[#14AE5C]' },
  [ProjectStatus.ARCHIVED]: { label: 'Archived', bg: 'bg-[rgba(128,128,128,0.12)]', color: 'text-[#808080]' },
  [ProjectStatus.DELETED]: { label: 'Deleted', bg: 'bg-[rgba(242,72,34,0.12)]', color: 'text-[#F24822]' },
};

/** Project detail page header with metadata and actions */
export function ProjectHeader({ project }: ProjectHeaderProps) {
  const status = STATUS_CONFIG[project.status];

  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-[rgba(12,140,233,0.12)] flex items-center justify-center">
          <FolderKanban size={22} className="text-[#0C8CE9]" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[1.25rem] font-bold text-white">{project.name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#666666]">
            {project.figmaFileKey && (
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-[#A259FF]" />
                Figma connected
              </span>
            )}
            {project.githubRepoId && (
              <span className="flex items-center gap-1">
                <GitBranch size={11} />
                GitHub connected
              </span>
            )}
            {project.description && (
              <span className="hidden sm:block text-[#808080]">{project.description}</span>
            )}
            <span className="text-[#444444]">Updated {formatDateTime(project.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {project.status === ProjectStatus.ACTIVE && (
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#383838] text-xs text-[#B3B3B3] hover:bg-[#383838] hover:text-white transition-colors duration-150">
            <Archive size={13} />
            Archive
          </button>
        )}
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#383838] text-[#808080] hover:bg-[#383838] hover:text-white transition-colors duration-150">
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}
