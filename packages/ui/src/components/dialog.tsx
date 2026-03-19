import * as React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

/** Modal dialog component — Figma flat style */
export function Dialog({ open, onClose, title, children, maxWidth = 'max-w-md' }: DialogProps) {
  // Close on Escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={`relative w-full ${maxWidth} mx-4 rounded-xl border border-[#383838] bg-[#2C2C2C] shadow-lg`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#383838]">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#808080] hover:text-white transition-colors duration-150"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
