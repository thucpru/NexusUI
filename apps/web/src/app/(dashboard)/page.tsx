'use client';


import { useProjects } from '@/lib/hooks/use-projects';
import { useCreditBalance } from '@/lib/hooks/use-credit-balance';
import { useGenerations } from '@/lib/hooks/use-generations';
import { ProjectCard } from '@/components/dashboard/project-card';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { CreditUsageChart } from '@/components/dashboard/credit-usage-chart';
import { ProjectStatus } from '@nexusui/shared';
import type { Project } from '@nexusui/shared';
import { FolderKanban, Sparkles, CreditCard, Plus } from 'lucide-react';
import Link from 'next/link';

/** Dashboard overview page */
export default function DashboardPage() {
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: creditData } = useCreditBalance();
  const { data: generationsData } = useGenerations();

  const projects = projectsData?.data ?? [];
  const activeProjects = projects.filter((p: Project) => p.status === ProjectStatus.ACTIVE);
  const totalGenerations = generationsData?.total ?? 0;
  const creditBalance = creditData?.balance ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="Active Projects"
          value={activeProjects.length}
          icon={FolderKanban}
          iconColor="#0C8CE9"
          iconBg="rgba(12,140,233,0.12)"
        />
        <StatsCard
          label="Total Generations"
          value={totalGenerations.toLocaleString()}
          icon={Sparkles}
          iconColor="#A259FF"
          iconBg="rgba(162,89,255,0.12)"
        />
        <StatsCard
          label="Credit Balance"
          value={creditBalance.toLocaleString()}
          icon={CreditCard}
          iconColor="#14AE5C"
          iconBg="rgba(20,174,92,0.12)"
        />
      </div>

      {/* Chart + activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CreditUsageChart />
        <ActivityFeed />
      </div>

      {/* Projects grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Your Projects</h2>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#0C8CE9] text-white text-xs font-medium hover:bg-[#0D99FF] transition-colors duration-150"
          >
            <Plus size={13} />
            New Project
          </Link>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-lg skeleton" />
            ))}
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center rounded-lg border border-[#383838] bg-[#2C2C2C]">
            <FolderKanban size={32} className="text-[#444444] mb-3" />
            <p className="text-sm text-[#B3B3B3] mb-1">No projects yet</p>
            <p className="text-xs text-[#666666] mb-4">
              Create your first project to start generating components
            </p>
            <Link
              href="/projects"
              className="h-8 px-4 rounded-md bg-[#0C8CE9] text-white text-xs font-medium inline-flex items-center hover:bg-[#0D99FF] transition-colors"
            >
              Create project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.slice(0, 6).map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
