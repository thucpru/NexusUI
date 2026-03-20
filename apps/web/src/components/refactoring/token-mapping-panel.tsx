'use client';

import { useState } from 'react';
import type { StyleChanges } from '@nexusui/shared';
import { ChevronDown, ChevronRight, Plus, Minus, RefreshCw } from 'lucide-react';

interface TokenMappingPanelProps {
  styleChanges: StyleChanges;
  defaultOpen?: boolean;
}

interface SectionProps {
  label: string;
  items: string[];
  icon: React.ReactNode;
  emptyText: string;
  itemClass: string;
}

function Section({ label, items, icon, emptyText, itemClass }: SectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-[#383838] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-[#252525] hover:bg-[#2C2C2C] transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-[#B3B3B3]">
          {icon}
          {label}
          <span className="px-1.5 py-0.5 rounded-full bg-[#383838] text-[#808080] text-[10px]">
            {items.length}
          </span>
        </div>
        {open ? <ChevronDown size={13} className="text-[#666666]" /> : <ChevronRight size={13} className="text-[#666666]" />}
      </button>
      {open && (
        <div className="px-3 py-2 space-y-1 bg-[#1E1E1E]">
          {items.length === 0 ? (
            <p className="text-[11px] text-[#555555] italic">{emptyText}</p>
          ) : (
            items.map((item, i) => (
              <div key={i} className={['px-2 py-1 rounded text-[11px] font-mono', itemClass].join(' ')}>
                {item}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** Collapsible panel showing CSS/design token changes applied during beautification */
export function TokenMappingPanel({ styleChanges, defaultOpen = true }: TokenMappingPanelProps) {
  const [panelOpen, setPanelOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-[#383838] bg-[#2C2C2C] overflow-hidden">
      <button
        onClick={() => setPanelOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#333333] transition-colors"
      >
        <span className="text-sm font-semibold text-white">Style Changes</span>
        {panelOpen ? <ChevronDown size={15} className="text-[#666666]" /> : <ChevronRight size={15} className="text-[#666666]" />}
      </button>

      {panelOpen && (
        <div className="px-4 pb-4 space-y-3">
          <Section
            label="Added"
            items={styleChanges.added}
            icon={<Plus size={12} className="text-[#14AE5C]" />}
            emptyText="No classes added"
            itemClass="bg-[rgba(20,174,92,0.1)] text-[#14AE5C]"
          />
          <Section
            label="Removed"
            items={styleChanges.removed}
            icon={<Minus size={12} className="text-[#F24822]" />}
            emptyText="No classes removed"
            itemClass="bg-[rgba(242,72,34,0.1)] text-[#F24822]"
          />
          <Section
            label="Modified"
            items={styleChanges.modified}
            icon={<RefreshCw size={12} className="text-[#F5A623]" />}
            emptyText="No classes modified"
            itemClass="bg-[rgba(245,166,35,0.1)] text-[#F5A623]"
          />
        </div>
      )}
    </div>
  );
}
