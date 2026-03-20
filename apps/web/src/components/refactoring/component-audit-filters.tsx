'use client';

import { Search, ArrowUpDown } from 'lucide-react';
import type { LogicSafety, StyleIssueType } from '@nexusui/shared';
import { STYLE_ISSUE_LABELS, LOGIC_SAFETY_LABELS } from '@nexusui/shared';

export interface AuditFilterState {
  search: string;
  safety: LogicSafety | 'ALL';
  issueType: StyleIssueType | 'ALL';
  sortBy: 'issueCount' | 'name' | 'path';
}

interface ComponentAuditFiltersProps {
  filters: AuditFilterState;
  onChange: (next: AuditFilterState) => void;
}

const selectClass = [
  'h-8 px-2 rounded-md text-xs text-white bg-[#2C2C2C] border border-[#383838]',
  'focus:outline-none focus:border-[#0C8CE9] transition-colors duration-150',
].join(' ');

/** Filter/sort bar for the component audit grid */
export function ComponentAuditFilters({ filters, onChange }: ComponentAuditFiltersProps) {
  function set<K extends keyof AuditFilterState>(key: K, value: AuditFilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#808080]" />
        <input
          type="text"
          placeholder="Search components…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className={[
            'w-full h-8 pl-8 pr-3 rounded-md text-xs text-white placeholder:text-[#808080]',
            'bg-[#2C2C2C] border border-[#383838] focus:outline-none focus:border-[#0C8CE9] transition-colors',
          ].join(' ')}
        />
      </div>

      {/* Safety filter */}
      <select
        value={filters.safety}
        onChange={(e) => set('safety', e.target.value as AuditFilterState['safety'])}
        className={selectClass}
      >
        <option value="ALL">All Safety Levels</option>
        {(Object.keys(LOGIC_SAFETY_LABELS) as LogicSafety[]).map((k) => (
          <option key={k} value={k}>{LOGIC_SAFETY_LABELS[k]}</option>
        ))}
      </select>

      {/* Issue type filter */}
      <select
        value={filters.issueType}
        onChange={(e) => set('issueType', e.target.value as AuditFilterState['issueType'])}
        className={selectClass}
      >
        <option value="ALL">All Issue Types</option>
        {(Object.keys(STYLE_ISSUE_LABELS) as StyleIssueType[]).map((k) => (
          <option key={k} value={k}>{STYLE_ISSUE_LABELS[k]}</option>
        ))}
      </select>

      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <ArrowUpDown size={12} className="text-[#666666]" />
        <select
          value={filters.sortBy}
          onChange={(e) => set('sortBy', e.target.value as AuditFilterState['sortBy'])}
          className={selectClass}
        >
          <option value="issueCount">Sort: Issues</option>
          <option value="name">Sort: Name</option>
          <option value="path">Sort: Path</option>
        </select>
      </div>
    </div>
  );
}
