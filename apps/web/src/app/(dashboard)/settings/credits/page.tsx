'use client';


import { useCreditBalance, useCreditLedger, useCreditPackages, usePurchaseCredits } from '@/lib/hooks/use-credit-balance';
import { CreditPackageCard } from '@/components/credits/credit-package-card';
import { CreditHistoryTable } from '@/components/credits/credit-history-table';
import { CreditBalanceBar } from '@/components/credits/credit-balance-bar';
import { CreditCard } from 'lucide-react';
import type { CreditPackage } from '@nexusui/shared';

/** Credits page — balance overview, buy packages, transaction history */
export default function CreditsPage() {
  const { data: balanceData, isLoading: balanceLoading } = useCreditBalance();
  const { data: ledgerData, isLoading: ledgerLoading } = useCreditLedger();
  const { data: packages, isLoading: packagesLoading } = useCreditPackages();
  const purchaseMutation = usePurchaseCredits();

  const balance = balanceData?.balance ?? 0;
  const activePackages = (packages ?? []).filter((p: CreditPackage) => p.isActive);
  const ledgerEntries = ledgerData?.data ?? [];

  async function handlePurchase(packageId: string) {
    try {
      const result = await purchaseMutation.mutateAsync(packageId);
      // Redirect to Stripe Checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch {
      // Error handled by mutation state
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Balance overview */}
      <div>
        <div className="mb-4">
          <h1 className="text-[1.25rem] font-bold text-white">Credits</h1>
          <p className="text-sm text-[#808080] mt-0.5">Buy credit packages and view your transaction history</p>
        </div>

        <div className="p-5 rounded-xl border border-[#383838] bg-[#2C2C2C]">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={15} className="text-[#0C8CE9]" />
            <h2 className="text-sm font-semibold text-white">Current Balance</h2>
          </div>

          {balanceLoading ? (
            <div className="space-y-2">
              <div className="h-8 w-24 rounded skeleton" />
              <div className="h-2 rounded skeleton" />
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-white mb-4">
                {balance.toLocaleString()}
                <span className="text-base text-[#808080] font-normal ml-2">credits</span>
              </div>
              <CreditBalanceBar balance={balance} maxCredits={2000} />
            </>
          )}
        </div>
      </div>

      {/* Buy packages */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Buy Credits</h2>
        {packagesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-56 rounded-xl skeleton" />)}
          </div>
        ) : activePackages.length === 0 ? (
          <p className="text-sm text-[#808080]">No packages available at this time.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activePackages.map((pkg: CreditPackage) => (
              <CreditPackageCard
                key={pkg.id}
                pkg={pkg}
                onPurchase={handlePurchase}
                isPurchasing={purchaseMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Transaction History</h2>
        <CreditHistoryTable entries={ledgerEntries} isLoading={ledgerLoading} />
      </div>
    </div>
  );
}
