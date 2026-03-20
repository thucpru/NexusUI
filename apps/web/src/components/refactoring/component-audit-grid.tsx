'use client';

import { useState, useMemo } from 'react';
import type { ComponentAuditDto } from '@nexusui/shared';
import { ComponentAuditCard } from './component-audit-card';
import { ComponentAuditFilters } from './component-audit-filters';
import type { AuditFilterState } from './component-audit-filters';
import { useBeautifyComponent } from '@/lib/hooks/use-refactoring';
import { Sparkles, PackageOpen } from 'lucide-react';

interface ComponentAuditGridProps {
  components: ComponentAuditDto[];
  projectId: string;
  defaultAiModelId?: string;
}

const DEFAULT_FILTERS: AuditFilterState = {
  search: '', safety: 'ALL', issueType: 'ALL', sortBy: 'issueCount',
};

/** Responsive grid of component audits with batch-select and beautify action */
export function ComponentAuditGrid({ components, projectId, defaultAiModelId = 'gpt-4o' }: ComponentAuditGridProps) {
  const [filters, setFilters] = useState<AuditFilterState>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { mutate: beautify, isPending } = useBeautifyComponent();

  const filtered = useMemo(() => {
    let result = [...components];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) => c.componentName.toLowerCase().includes(q) || c.filePath.toLowerCase().includes(q),
      );
    }
    if (filters.safety !== 'ALL') result = result.filter((c) => c.logicSafety === filters.safety);
    if (filters.issueType !== 'ALL') {
      result = result.filter((c) => c.styleIssues.some((i) => i.type === filters.issueType));
    }
    result.sort((a, b) => {
      if (filters.sortBy === 'issueCount') return b.issueCount - a.issueCount;
      if (filters.sortBy === 'name') return a.componentName.localeCompare(b.componentName);
      return a.filePath.localeCompare(b.filePath);
    });
    return result;
  }, [components, filters]);

  function handleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  function handleBeautifySelected() {
    const selectedComponents = filtered.filter((c) => selected.has(c.id));
    selectedComponents.forEach((c) => {
      beautify({ projectId, componentPath: c.filePath, aiModelId: defaultAiModelId });
    });
    setSelected(new Set());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <ComponentAuditFilters filters={filters} onChange={setFilters} />
        {selected.size > 0 && (
          <button
            onClick={handleBeautifySelected}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-8 px-3 rounded-md text-xs font-medium bg-[#A259FF] text-white hover:brightness-110 disabled:opacity-50 transition-all"
          >
            <Sparkles size={12} />
            {isPending ? 'Processing…' : `Beautify ${selected.size} selected`}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <PackageOpen size={32} className="text-[#444444] mb-3" />
          <p className="text-sm text-[#B3B3B3]">No components found</p>
          <p className="text-xs text-[#666666] mt-1">Try adjusting your filters or run a scan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((component) => (
            <ComponentAuditCard
              key={component.id}
              component={component}
              projectId={projectId}
              selected={selected.has(component.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-[11px] text-[#666666] text-right">
          {filtered.length} component{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
