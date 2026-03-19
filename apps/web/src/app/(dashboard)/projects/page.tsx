'use client';


import { useState } from 'react';
import { useProjects, useCreateProject, useDeleteProject } from '@/lib/hooks/use-projects';
import { ProjectCard } from '@/components/dashboard/project-card';
import { ProjectStatus } from '@nexusui/shared';
import type { Project } from '@nexusui/shared';
import { Plus, Search, FolderKanban, Trash2 } from 'lucide-react';

/** Projects list page with search and create dialog */
export default function ProjectsPage() {
  const { data, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const projects = (data?.data ?? []).filter(
    (p: Project) =>
      p.status !== ProjectStatus.DELETED &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())),
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const trimmed = newDesc.trim();
    const payload: { name: string; description?: string } = { name: newName.trim() };
    if (trimmed) payload.description = trimmed;
    await createProject.mutateAsync(payload);
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.25rem] font-bold text-white">Projects</h1>
          <p className="text-sm text-[#808080] mt-0.5">Manage your design system projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-[#0C8CE9] text-white text-sm font-medium hover:bg-[#0D99FF] transition-colors duration-150"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-md bg-[#2C2C2C] border border-[#383838] text-sm text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9] focus:ring-1 focus:ring-[rgba(12,140,233,0.2)] transition-colors"
        />
      </div>

      {/* Project grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-lg skeleton" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <FolderKanban size={32} className="text-[#444444] mb-3" />
          <p className="text-sm text-[#B3B3B3]">{search ? 'No projects match your search' : 'No projects yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: Project) => (
            <div key={project.id} className="relative group">
              <ProjectCard project={project} />
              <button
                onClick={(e) => { e.preventDefault(); deleteProject.mutate(project.id); }}
                className="absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center text-[#666666] opacity-0 group-hover:opacity-100 hover:text-[#F24822] hover:bg-[rgba(242,72,34,0.1)] transition-all duration-150"
                aria-label="Delete project"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create project modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm mx-4 p-6 rounded-xl border border-[#383838] bg-[#2C2C2C] shadow-lg">
            <h2 className="text-sm font-semibold text-white mb-4">New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-[#B3B3B3] mb-1.5">Project name *</label>
                <input
                  type="text"
                  placeholder="My Design System"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  autoFocus
                  className="w-full h-9 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-sm text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#B3B3B3] mb-1.5">Description (optional)</label>
                <textarea
                  placeholder="Brief description..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md bg-[#383838] border border-[#4D4D4D] text-sm text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9] resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-9 rounded-md border border-[#383838] text-sm text-[#B3B3B3] hover:bg-[#383838] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProject.isPending}
                  className="flex-1 h-9 rounded-md bg-[#0C8CE9] text-white text-sm font-medium hover:bg-[#0D99FF] disabled:opacity-50 transition-colors"
                >
                  {createProject.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
