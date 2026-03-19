'use client';

import { useState } from 'react';
import { useAdminCreditPackages, useDeleteCreditPackage } from '@/lib/hooks/use-admin';
import { formatPriceUsd } from '@nexusui/shared';
import type { CreditPackage } from '@nexusui/shared';
import { Pencil, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { PackageFormDialog } from './package-form-dialog';

/** Admin table for managing credit packages */
export function PackageConfigTable() {
  const { data: packages, isLoading } = useAdminCreditPackages();
  const deletePackage = useDeleteCreditPackage();
  const [editingPkg, setEditingPkg] = useState<CreditPackage | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg skeleton" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#0C8CE9] text-white text-xs font-medium hover:bg-[#0D99FF] transition-colors"
        >
          <Plus size={13} />
          Add Package
        </button>
      </div>

      <div className="rounded-lg border border-[#383838] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#2C2C2C] border-b border-[#383838]">
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Name</th>
              <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium">Credits</th>
              <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium">Price</th>
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium hidden md:table-cell">Stripe Price ID</th>
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Active</th>
              <th className="px-4 py-2.5 w-16" />
            </tr>
          </thead>
          <tbody>
            {(packages ?? []).map((pkg: CreditPackage) => (
              <tr key={pkg.id} className="border-b border-[#383838] last:border-0 hover:bg-[#2C2C2C] transition-colors">
                <td className="px-4 py-3 text-xs font-medium text-white">{pkg.name}</td>
                <td className="px-4 py-3 text-right text-xs text-[#0C8CE9] font-semibold">
                  {pkg.credits.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-xs text-white">
                  {formatPriceUsd(pkg.priceUsd * 100)}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <code className="text-[11px] text-[#666666] font-mono">{pkg.stripePriceId || '—'}</code>
                </td>
                <td className="px-4 py-3">
                  {pkg.isActive
                    ? <CheckCircle size={13} className="text-[#14AE5C]" />
                    : <XCircle size={13} className="text-[#808080]" />
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setEditingPkg(pkg)}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#808080] hover:text-white hover:bg-[#383838] transition-colors"
                    >
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => deletePackage.mutate(pkg.id)}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#808080] hover:text-[#F24822] hover:bg-[rgba(242,72,34,0.1)] transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(packages ?? []).length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-[#808080]">
            No packages configured
          </div>
        )}
      </div>

      {(showCreate || editingPkg) && (
        <PackageFormDialog
          pkg={editingPkg}
          onClose={() => { setEditingPkg(null); setShowCreate(false); }}
        />
      )}
    </>
  );
}
