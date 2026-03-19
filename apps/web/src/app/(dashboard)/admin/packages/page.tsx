
import { PackageConfigTable } from '@/components/admin/package-config-table';

export const metadata = { title: 'Credit Packages' };

/** Admin credit package configuration page */
export default function AdminPackagesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[1.25rem] font-bold text-white">Credit Packages</h1>
        <p className="text-sm text-[#808080] mt-0.5">
          Configure purchasable credit packages shown to users on the pricing page.
        </p>
      </div>
      <PackageConfigTable />
    </div>
  );
}
