'use client';

import { useState } from 'react';
import { Sparkles, GitPullRequest, Loader2, Zap, ChevronDown } from 'lucide-react';
import type { AIModelRef } from '@nexusui/shared';

interface BeautifyActionBarProps {
  projectId: string;
  componentPath: string;
  estimatedCredits: number;
  creditBalance: number;
  aiModels: AIModelRef[];
  selectedJobIds?: string[];
  onBeautify: (aiModelId: string) => void;
  onGeneratePr?: () => void;
  isBeautifying?: boolean;
  isGeneratingPr?: boolean;
}

/** Sticky action bar with model selector, credit cost, beautify and PR actions */
export function BeautifyActionBar({
  estimatedCredits,
  creditBalance,
  aiModels,
  selectedJobIds = [],
  onBeautify,
  onGeneratePr,
  isBeautifying = false,
  isGeneratingPr = false,
}: BeautifyActionBarProps) {
  const [selectedModel, setSelectedModel] = useState<string>(aiModels[0]?.id ?? '');
  const hasEnoughCredits = creditBalance >= estimatedCredits;
  const canGeneratePr = selectedJobIds.length > 0 && !isGeneratingPr;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 bg-[#1E1E1E] border-t border-[#383838] px-6 py-3">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3">
        {/* AI Model selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#808080] shrink-0">Model</label>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={[
                'h-8 pl-3 pr-7 rounded-md text-xs text-white bg-[#2C2C2C] border border-[#383838]',
                'focus:outline-none focus:border-[#0C8CE9] transition-colors appearance-none',
              ].join(' ')}
            >
              {aiModels.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
          </div>
        </div>

        {/* Credit cost */}
        <div className="flex items-center gap-1.5 text-xs">
          <Zap size={12} className="text-[#A259FF]" />
          <span className={hasEnoughCredits ? 'text-[#A259FF]' : 'text-[#F24822]'}>
            {estimatedCredits} credits
          </span>
          {!hasEnoughCredits && (
            <span className="text-[#F24822]">(Insufficient balance: {creditBalance})</span>
          )}
        </div>

        <div className="flex-1" />

        {/* Generate PR button */}
        {onGeneratePr && (
          <button
            onClick={onGeneratePr}
            disabled={!canGeneratePr}
            className={[
              'inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150',
              'border border-[#383838] text-[#B3B3B3] hover:bg-[#383838] hover:text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            {isGeneratingPr ? <Loader2 size={14} className="animate-spin" /> : <GitPullRequest size={14} />}
            {isGeneratingPr ? 'Generating…' : 'Generate PR'}
          </button>
        )}

        {/* Beautify button */}
        <button
          onClick={() => onBeautify(selectedModel)}
          disabled={isBeautifying || !hasEnoughCredits || !selectedModel}
          className={[
            'inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-colors duration-150',
            'bg-[#A259FF] text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {isBeautifying ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {isBeautifying ? 'Beautifying…' : 'Beautify'}
        </button>
      </div>
    </div>
  );
}
