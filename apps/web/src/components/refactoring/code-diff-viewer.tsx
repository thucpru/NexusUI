'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  lineNum: number;
  content: string;
}

interface CodeDiffViewerProps {
  diff: string; // unified diff or raw diff text
  collapsedContextLines?: number;
}

/** Parse a simple unified diff format into structured lines */
function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split('\n');
  let lineNum = 0;
  return lines.map((raw) => {
    if (raw.startsWith('+') && !raw.startsWith('+++')) {
      lineNum++;
      return { type: 'added' as const, lineNum, content: raw.slice(1) };
    } else if (raw.startsWith('-') && !raw.startsWith('---')) {
      lineNum++;
      return { type: 'removed' as const, lineNum, content: raw.slice(1) };
    } else {
      lineNum++;
      return { type: 'unchanged' as const, lineNum, content: raw };
    }
  });
}

const LINE_STYLES: Record<DiffLine['type'], string> = {
  added: 'bg-[rgba(20,174,92,0.1)] text-[#14AE5C]',
  removed: 'bg-[rgba(242,72,34,0.1)] text-[#F24822]',
  unchanged: 'text-[#666666]',
};

const LINE_PREFIX: Record<DiffLine['type'], string> = {
  added: '+',
  removed: '-',
  unchanged: ' ',
};

/** Line-by-line diff viewer with collapsible unchanged sections */
export function CodeDiffViewer({ diff, collapsedContextLines = 3 }: CodeDiffViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = parseDiff(diff);

  // Group unchanged lines that are surrounded by changes into collapsible chunks
  const changedIndices = new Set(
    lines.map((l, i) => (l.type !== 'unchanged' ? i : -1)).filter((i) => i >= 0),
  );

  function isVisible(index: number): boolean {
    if (expanded) return true;
    for (const ci of changedIndices) {
      if (Math.abs(index - ci) <= collapsedContextLines) return true;
    }
    return changedIndices.size === 0; // show all if no changes
  }

  // Find collapsed ranges
  const collapsedCount = lines.filter((_, i) => !isVisible(i)).length;

  return (
    <div className="rounded-lg border border-[#383838] bg-[#1A1A1A] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#383838] bg-[#252525]">
        <span className="text-xs text-[#808080]">Diff</span>
        {collapsedCount > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] text-[#0C8CE9] hover:text-[#0D99FF] transition-colors"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {expanded ? 'Collapse unchanged' : `Show ${collapsedCount} hidden lines`}
          </button>
        )}
      </div>

      {/* Diff lines */}
      <div className="overflow-auto max-h-[420px]">
        <table className="w-full text-xs font-mono border-collapse">
          <tbody>
            {lines.map((line, i) =>
              isVisible(i) ? (
                <tr key={i} className={LINE_STYLES[line.type]}>
                  <td className="select-none w-10 text-right pr-3 pl-2 text-[#444444] border-r border-[#333333] py-px">
                    {line.lineNum}
                  </td>
                  <td className="select-none w-5 text-center text-[#555555]">
                    {LINE_PREFIX[line.type]}
                  </td>
                  <td className="pl-2 pr-4 py-px whitespace-pre">{line.content}</td>
                </tr>
              ) : null,
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
