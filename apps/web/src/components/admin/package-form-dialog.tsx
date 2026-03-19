'use client';

import { useState } from 'react';
import { useCreateCreditPackage, useUpdateCreditPackage } from '@/lib/hooks/use-admin';
import type { CreditPackage } from '@nexusui/shared';
import { X } from 'lucide-react';

interface PackageFormDialogProps {
  pkg: CreditPackage | null;
  onClose: () => void;
}

/** Dialog for creating or editing a credit package */
export function PackageFormDialog({ pkg, onClose }: PackageFormDialogProps) {
  const createPkg = useCreateCreditPackage();
  const updatePkg = useUpdateCreditPackage();
  const isEditing = !!pkg;

  const [form, setForm] = useState({
    name: pkg?.name ?? '',
    credits: pkg?.credits ?? 100,
    priceUsd: pkg?.priceUsd ?? 5,
    stripePriceId: pkg?.stripePriceId ?? '',
    isActive: pkg?.isActive ?? true,
  });

  function set(key: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      credits: Number(form.credits),
      priceUsd: Number(form.priceUsd),
      stripePriceId: form.stripePriceId,
      isActive: form.isActive,
    };

    if (isEditing) {
      await updatePkg.mutateAsync({ id: pkg.id, data: payload });
    } else {
      await createPkg.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = createPkg.isPending || updatePkg.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm mx-4 rounded-xl border border-[#383838] bg-[#2C2C2C] shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#383838]">
          <h2 className="text-sm font-semibold text-white">
            {isEditing ? 'Edit Package' : 'New Credit Package'}
          </h2>
          <button onClick={onClose} className="text-[#808080] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-[#B3B3B3] mb-1">Package name *</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Pro"
              className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#B3B3B3] mb-1">Credits *</label>
              <input required type="number" min={10} value={form.credits} onChange={(e) => set('credits', Number(e.target.value))}
                className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white focus:outline-none focus:border-[#0C8CE9]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B3B3B3] mb-1">Price (USD) *</label>
              <input required type="number" min={0.01} step={0.01} value={form.priceUsd} onChange={(e) => set('priceUsd', Number(e.target.value))}
                className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white focus:outline-none focus:border-[#0C8CE9]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#B3B3B3] mb-1">Stripe Price ID</label>
            <input value={form.stripePriceId} onChange={(e) => set('stripePriceId', e.target.value)}
              placeholder="price_..."
              className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white font-mono placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)}
              className="w-4 h-4 rounded accent-[#0C8CE9]"
            />
            <span className="text-xs text-[#B3B3B3]">Active (visible to users)</span>
          </label>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 rounded-md border border-[#383838] text-xs text-[#B3B3B3] hover:bg-[#383838] transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 h-9 rounded-md bg-[#0C8CE9] text-white text-xs font-medium hover:bg-[#0D99FF] disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
