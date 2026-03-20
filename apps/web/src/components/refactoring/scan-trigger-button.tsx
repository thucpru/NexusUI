'use client';

import { ScanLine, Loader2 } from 'lucide-react';
import { useScanComponents } from '@/lib/hooks/use-refactoring';

interface ScanTriggerButtonProps {
  projectId: string;
  branch?: string;
}

/** Button that triggers a full component scan on the project repository */
export function ScanTriggerButton({ projectId, branch }: ScanTriggerButtonProps) {
  const { mutate: scan, isPending } = useScanComponents();

  function handleScan() {
    const req: { projectId: string; branch?: string } = { projectId };
    if (branch) req.branch = branch;
    scan(req);
  }

  return (
    <button
      onClick={handleScan}
      disabled={isPending}
      className={[
        'inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C8CE9] focus-visible:ring-offset-1',
        'focus-visible:ring-offset-[#1E1E1E] disabled:opacity-50 disabled:cursor-not-allowed',
        isPending
          ? 'bg-[#0C8CE9] text-white cursor-not-allowed'
          : 'bg-[#0C8CE9] text-white hover:bg-[#0D99FF]',
      ].join(' ')}
    >
      {isPending
        ? <Loader2 size={14} className="animate-spin" />
        : <ScanLine size={14} />
      }
      {isPending ? 'Scanning…' : 'Scan Components'}
    </button>
  );
}
