import { UserManagementTable } from '@/components/admin/user-management-table';

export const metadata = { title: 'User Management' };

/** Admin user management page */
export default function AdminUsersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[1.25rem] font-bold text-white">User Management</h1>
        <p className="text-sm text-[#808080] mt-0.5">
          View users, adjust credit balances, and manage roles.
        </p>
      </div>
      <UserManagementTable />
    </div>
  );
}
