'use client';

import { useState } from 'react';
import { useAdminAIModels, useDeleteAIModel } from '@/lib/hooks/use-admin';
import { AIModelStatus, AIModelProvider } from '@nexusui/shared';
import type { AIModel } from '@nexusui/shared';
import { formatDateTime } from '@nexusui/shared';
import { Pencil, Trash2, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { ModelFormDialog } from './model-form-dialog';

const STATUS_CONFIG = {
  [AIModelStatus.ACTIVE]: { icon: CheckCircle, color: 'text-[#14AE5C]', label: 'Active' },
  [AIModelStatus.INACTIVE]: { icon: XCircle, color: 'text-[#808080]', label: 'Inactive' },
  [AIModelStatus.DEPRECATED]: { icon: AlertTriangle, color: 'text-[#F2994A]', label: 'Deprecated' },
};

const PROVIDER_LABELS: Record<AIModelProvider, string> = {
  [AIModelProvider.ANTHROPIC]: 'Anthropic',
  [AIModelProvider.OPENAI]: 'OpenAI',
  [AIModelProvider.GOOGLE]: 'Google',
  [AIModelProvider.MISTRAL]: 'Mistral',
  [AIModelProvider.CUSTOM]: 'Custom',
};

/** Admin table for managing AI model registry */
export function ModelRegistryTable() {
  const { data: models, isLoading } = useAdminAIModels();
  const deleteModel = useDeleteAIModel();
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#383838] overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#383838]">
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/4 rounded skeleton" />
              <div className="h-2.5 w-1/6 rounded skeleton" />
            </div>
          </div>
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
          Add Model
        </button>
      </div>

      <div className="rounded-lg border border-[#383838] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#2C2C2C] border-b border-[#383838]">
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Model</th>
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Provider</th>
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Model ID</th>
              <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium">Credits/req</th>
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Status</th>
              <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium hidden md:table-cell">Updated</th>
              <th className="px-4 py-2.5 w-16" />
            </tr>
          </thead>
          <tbody>
            {(models ?? []).map((model: AIModel) => {
              const status = STATUS_CONFIG[model.status as AIModelStatus];
              const StatusIcon = status?.icon ?? CheckCircle;
              return (
                <tr key={model.id} className="border-b border-[#383838] last:border-0 hover:bg-[#2C2C2C] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white text-xs">{model.displayName}</div>
                    <div className="text-[11px] text-[#666666]">{model.name}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#B3B3B3]">{PROVIDER_LABELS[model.provider as AIModelProvider] ?? model.provider}</td>
                  <td className="px-4 py-3">
                    <code className="text-[11px] text-[#808080] font-mono">{model.providerModelId}</code>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-[#0C8CE9] font-semibold">
                    {model.config.creditCostPerRequest}
                  </td>
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1 text-xs ${status?.color ?? 'text-[#808080]'}`}>
                      <StatusIcon size={11} />
                      {status?.label ?? model.status}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-[11px] text-[#666666] hidden md:table-cell">
                    {formatDateTime(model.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setEditingModel(model)}
                        className="w-6 h-6 flex items-center justify-center rounded text-[#808080] hover:text-white hover:bg-[#383838] transition-colors"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => deleteModel.mutate(model.id)}
                        className="w-6 h-6 flex items-center justify-center rounded text-[#808080] hover:text-[#F24822] hover:bg-[rgba(242,72,34,0.1)] transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(models ?? []).length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-[#808080]">
            No AI models registered yet
          </div>
        )}
      </div>

      {(showCreate || editingModel) && (
        <ModelFormDialog
          model={editingModel}
          onClose={() => { setEditingModel(null); setShowCreate(false); }}
        />
      )}
    </>
  );
}
