import type { CreditPackage } from '@nexusui/shared';
import { formatPriceUsd } from '@nexusui/shared';
import { Check, Sparkles } from 'lucide-react';

interface CreditPackageCardProps {
  pkg: CreditPackage;
  onPurchase: (packageId: string) => void;
  isPurchasing: boolean;
}

/** Card for purchasing a credit package via Stripe Checkout */
export function CreditPackageCard({ pkg, onPurchase, isPurchasing }: CreditPackageCardProps) {
  return (
    <div className="p-5 rounded-xl border border-[#383838] bg-[#2C2C2C] hover:border-[#4D4D4D] transition-colors duration-150">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">{pkg.name}</h3>
      </div>

      <div className="mb-4">
        <div className="text-2xl font-bold text-white">{formatPriceUsd(pkg.priceUsd * 100)}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <Sparkles size={12} className="text-[#A259FF]" />
          <span className="text-sm font-semibold text-[#0C8CE9]">
            {pkg.credits.toLocaleString()} credits
          </span>
        </div>
      </div>

      <ul className="space-y-1.5 mb-5">
        <li className="flex items-center gap-1.5 text-xs text-[#B3B3B3]">
          <Check size={12} className="text-[#14AE5C]" />
          Credits never expire
        </li>
        <li className="flex items-center gap-1.5 text-xs text-[#B3B3B3]">
          <Check size={12} className="text-[#14AE5C]" />
          All AI models included
        </li>
        <li className="flex items-center gap-1.5 text-xs text-[#B3B3B3]">
          <Check size={12} className="text-[#14AE5C]" />
          One-time payment
        </li>
      </ul>

      <button
        onClick={() => onPurchase(pkg.id)}
        disabled={isPurchasing || !pkg.isActive}
        className="w-full h-9 rounded-md bg-[#0C8CE9] text-white text-sm font-medium hover:bg-[#0D99FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {isPurchasing ? 'Redirecting...' : `Buy ${pkg.name}`}
      </button>
    </div>
  );
}
