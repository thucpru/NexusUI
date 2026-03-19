'use client';

import { useCreditBalance } from '@/lib/hooks/use-credit-balance';
import { formatCredits } from '@nexusui/shared';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';

/** Credit balance widget shown in sidebar footer — wallet format */
export function CreditBalanceDisplay() {
  const { data, isLoading } = useCreditBalance();

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg bg-[#2C2C2C] border border-[#383838]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded skeleton" />
          <div className="h-3 w-16 rounded skeleton" />
        </div>
        <div className="h-5 w-20 rounded skeleton" />
      </div>
    );
  }

  const balance = data?.balance ?? 0;

  return (
    <Link
      href="/settings/credits"
      className="block p-3 rounded-lg bg-[#2C2C2C] border border-[#383838] hover:border-[#4D4D4D] transition-colors duration-150 group"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <CreditCard size={13} className="text-[#808080]" />
          <span className="text-xs text-[#808080]">Credits</span>
        </div>
        <span className="text-[10px] text-[#0C8CE9] opacity-0 group-hover:opacity-100 transition-opacity">
          Buy more →
        </span>
      </div>
      <div className="text-sm font-semibold text-white">
        {formatCredits(balance)}
      </div>
    </Link>
  );
}
