'use client';

import { useState } from 'react';
import { useCreateAIModel, useUpdateAIModel } from '@/lib/hooks/use-admin';
import { AIModelProvider, AIModelStatus } from '@nexusui/shared';
import type { AIModel } from '@nexusui/shared';
import { X } from 'lucide-react';

interface ModelFormDialogProps {
  model: AIModel | null;
  onClose: () => void;
}

/** Dialog for creating or editing an AI model entry */
export function ModelFormDialog({ model, onClose }: ModelFormDialogProps) {
  const createModel = useCreateAIModel();
  const updateModel = useUpdateAIModel();
  const isEditing = !!model;

  const [form, setForm] = useState({
    name: model?.name ?? '',
    displayName: model?.displayName ?? '',
    provider: model?.provider ?? AIModelProvider.OPENAI,
    providerModelId: model?.providerModelId ?? '',
    providerApiKeyRef: model?.providerApiKeyRef ?? '',
    status: model?.status ?? AIModelStatus.ACTIVE,
    creditCostPerRequest: model?.config.creditCostPerRequest ?? 10,
    maxOutputTokens: model?.config.maxOutputTokens ?? '',
  });

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      displayName: form.displayName,
      provider: form.provider,
      providerModelId: form.providerModelId,
      providerApiKeyRef: form.providerApiKeyRef,
      status: form.status,
      config: {
        creditCostPerRequest: Number(form.creditCostPerRequest),
        ...(form.maxOutputTokens ? { maxOutputTokens: Number(form.maxOutputTokens) } : {}),
      },
    };

    if (isEditing) {
      await updateModel.mutateAsync({ id: model.id, data: payload });
    } else {
      await createModel.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = createModel.isPending || updateModel.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md mx-4 rounded-xl border border-[#383838] bg-[#2C2C2C] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#383838]">
          <h2 className="text-sm font-semibold text-white">{isEditing ? 'Edit Model' : 'Add AI Model'}</h2>
          <button onClick={onClose} className="text-[#808080] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#B3B3B3] mb-1">Internal name *</label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B3B3B3] mb-1">Display name *</label>
              <input required value={form.displayName} onChange={(e) => set('displayName', e.target.value)}
                className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#B3B3B3] mb-1">Provider *</label>
              <select value={form.provider} onChange={(e) => set('provider', e.target.value)}
                className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white focus:outline-none focus:border-[#0C8CE9]"
              >
                {Object.values(AIModelProvider).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#B3B3B3] mb-1">Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}
                className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white focus:outline-none focus:border-[#0C8CE9]"
              >
                {Object.values(AIModelStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#B3B3B3] mb-1">Provider Model ID *</label>
            <input required placeholder="e.g. claude-3-5-sonnet-20241022" value={form.providerModelId} onChange={(e) => set('providerModelId', e.target.value)}
              className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white font-mono placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#B3B3B3] mb-1">API Key Reference *</label>
            <input required placeholder="e.g. ANTHROPIC_API_KEY" value={form.providerApiKeyRef} onChange={(e) => set('providerApiKeyRef', e.target.value)}
              className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white font-mono placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
            />
            <p className="text-[11px] text-[#666666] mt-1">Environment variable name holding the actual key.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#B3B3B3] mb-1">Credits per request *</label>
              <input required type="number" min={1} value={form.creditCostPerRequest} onChange={(e) => set('creditCostPerRequest', Number(e.target.value))}
                className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white focus:outline-none focus:border-[#0C8CE9]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B3B3B3] mb-1">Max output tokens</label>
              <input type="number" placeholder="Optional" value={form.maxOutputTokens} onChange={(e) => set('maxOutputTokens', e.target.value)}
                className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 rounded-md border border-[#383838] text-xs text-[#B3B3B3] hover:bg-[#383838] transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 h-9 rounded-md bg-[#0C8CE9] text-white text-xs font-medium hover:bg-[#0D99FF] disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
