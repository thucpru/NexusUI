import type { Project } from '@nexusui/shared';
import { ProjectStatus } from '@nexusui/shared';
import { formatRelativeTime } from '@nexusui/shared';
import { FolderKanban, GitBranch, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
}

const STATUS_STYLES: Record<ProjectStatus, { label: string; color: string }> = {
  [ProjectStatus.ACTIVE]: { label: 'Active', color: 'text-[#14AE5C]' },
  [ProjectStatus.ARCHIVED]: { label: 'Archived', color: 'text-[#808080]' },
  [ProjectStatus.DELETED]: { label: 'Deleted', color: 'text-[#F24822]' },
};

/** Project card for dashboard overview grid */
export function ProjectCard({ project }: ProjectCardProps) {
  const status = STATUS_STYLES[project.status];

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block p-5 rounded-lg border border-[#383838] bg-[#2C2C2C] hover:border-[#4D4D4D] transition-colors duration-150 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-md bg-[rgba(12,140,233,0.12)] flex items-center justify-center">
          <FolderKanban size={18} className="text-[#0C8CE9]" />
        </div>
        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
      </div>

      <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-[#0C8CE9] transition-colors duration-150 truncate">
        {project.name}
      </h3>

      {project.description && (
        <p className="text-xs text-[#808080] mb-3 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#383838]">
        <div className="flex items-center gap-3">
          {project.figmaFileKey && (
            <div className="flex items-center gap-1 text-[11px] text-[#808080]">
              <Sparkles size={11} className="text-[#A259FF]" />
              <span>Figma</span>
            </div>
          )}
          {project.githubRepoId && (
            <div className="flex items-center gap-1 text-[11px] text-[#808080]">
              <GitBranch size={11} />
              <span>GitHub</span>
            </div>
          )}
        </div>
        <span className="text-[11px] text-[#666666]">
          {formatRelativeTime(project.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
