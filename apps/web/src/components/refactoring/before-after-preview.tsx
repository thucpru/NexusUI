'use client';

import { useState } from 'react';
import { Columns2, Eye, Code2 } from 'lucide-react';

type ViewMode = 'before' | 'after' | 'split';

interface BeforeAfterPreviewProps {
  before: string;
  after: string;
  language?: string;
}

const CODE_STYLE = [
  'flex-1 min-w-0 overflow-auto rounded-lg border border-[#383838] bg-[#1A1A1A]',
  'p-4 text-xs font-mono text-[#D4D4D4] leading-relaxed whitespace-pre',
].join(' ');

/** Split view for comparing original and refactored component code */
export function BeforeAfterPreview({ before, after, language = 'tsx' }: BeforeAfterPreviewProps) {
  const [mode, setMode] = useState<ViewMode>('split');

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle controls */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#2C2C2C] border border-[#383838] w-fit">
        {(
          [
            { value: 'before' as ViewMode, label: 'Before', icon: Code2 },
            { value: 'after' as ViewMode, label: 'After', icon: Eye },
            { value: 'split' as ViewMode, label: 'Split', icon: Columns2 },
          ] as const
        ).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={[
              'inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-colors duration-150',
              mode === value
                ? 'bg-[#383838] text-white'
                : 'text-[#808080] hover:text-[#B3B3B3]',
            ].join(' ')}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Code panels */}
      <div className={['flex gap-3', mode === 'split' ? 'flex-row' : 'flex-col'].join(' ')}>
        {(mode === 'before' || mode === 'split') && (
          <div className="flex flex-col flex-1 min-w-0 gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[#808080] uppercase tracking-wider">Before</span>
              <span className="text-[10px] text-[#444444]">{language}</span>
            </div>
            <pre className={CODE_STYLE}>
              <code>{before}</code>
            </pre>
          </div>
        )}

        {mode === 'split' && (
          <div className="w-px bg-[#383838] self-stretch" />
        )}

        {(mode === 'after' || mode === 'split') && (
          <div className="flex flex-col flex-1 min-w-0 gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[#14AE5C] uppercase tracking-wider">After</span>
              <span className="text-[10px] text-[#444444]">{language}</span>
            </div>
            <pre className={[CODE_STYLE, 'border-[rgba(20,174,92,0.3)]'].join(' ')}>
              <code>{after}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
