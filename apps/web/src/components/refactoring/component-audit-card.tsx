'use client';

import Link from 'next/link';
import type { ComponentAuditDto } from '@nexusui/shared';
import { STYLE_ISSUE_LABELS } from '@nexusui/shared';
import { LogicSafetyBadge } from './logic-safety-badge';
import { FileCode2, Zap, AlertTriangle } from 'lucide-react';

interface ComponentAuditCardProps {
  component: ComponentAuditDto;
  projectId: string;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

/** Card displaying a single component audit — issues, safety level, credits */
export function ComponentAuditCard({
  component, projectId, selected = false, onSelect,
}: ComponentAuditCardProps) {
  const topIssues = component.styleIssues.slice(0, 3);

  return (
    <div
      className={[
        'relative p-4 rounded-lg border bg-[#2C2C2C] transition-colors duration-150 group',
        selected ? 'border-[#0C8CE9]' : 'border-[#383838] hover:border-[#4D4D4D]',
      ].join(' ')}
    >
      {/* Checkbox select */}
      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(component.id, e.target.checked)}
          className="absolute top-3 right-3 w-4 h-4 accent-[#0C8CE9] cursor-pointer"
          aria-label={`Select ${component.componentName}`}
        />
      )}

      <Link href={`/projects/${projectId}/refactor/${component.id}`} className="block">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-md bg-[rgba(162,89,255,0.12)] flex items-center justify-center shrink-0">
            <FileCode2 size={15} className="text-[#A259FF]" />
          </div>
          <div className="min-w-0 flex-1 pr-5">
            <p className="text-sm font-semibold text-white truncate group-hover:text-[#0C8CE9] transition-colors">
              {component.componentName}
            </p>
            <p className="text-[11px] text-[#666666] truncate mt-0.5">{component.filePath}</p>
          </div>
        </div>

        {/* Issue chips */}
        {topIssues.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {topIssues.map((issue) => (
              <span
                key={issue.type}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]"
              >
                <AlertTriangle size={9} />
                {STYLE_ISSUE_LABELS[issue.type] ?? issue.type}
              </span>
            ))}
            {component.styleIssues.length > 3 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#383838] text-[#808080]">
                +{component.styleIssues.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#383838]">
          <LogicSafetyBadge safety={component.logicSafety} />
          <div className="flex items-center gap-3 text-[11px] text-[#808080]">
            <span className="flex items-center gap-1">
              <AlertTriangle size={10} className="text-[#F5A623]" />
              {component.issueCount} issues
            </span>
            <span className="flex items-center gap-1 text-[#A259FF]">
              <Zap size={10} />
              {component.estimatedCredits} cr
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
