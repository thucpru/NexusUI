
import { ModelRegistryTable } from '@/components/admin/model-registry-table';

export const metadata = { title: 'AI Models' };

/** Admin AI model registry page */
export default function AdminModelsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[1.25rem] font-bold text-white">AI Model Registry</h1>
        <p className="text-sm text-[#808080] mt-0.5">
          Manage available AI models, their providers, and credit costs per request.
        </p>
      </div>
      <ModelRegistryTable />
    </div>
  );
}
