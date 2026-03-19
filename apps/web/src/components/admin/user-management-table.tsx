'use client';

import { useState } from 'react';
import { useAdminUsers, useAdminAdjustCredits, useUpdateUserRole } from '@/lib/hooks/use-admin';
import type { User } from '@nexusui/shared';
import { UserRole } from '@nexusui/shared';
import { formatDateTime, formatCredits } from '@nexusui/shared';
import { Search, ShieldCheck, Shield, Settings2, X } from 'lucide-react';

/** Dialog for admin credit adjustment */
function AdjustCreditsDialog({ user, onClose }: { user: User; onClose: () => void }) {
  const adjustCredits = useAdminAdjustCredits();
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await adjustCredits.mutateAsync({ userId: user.id, amount: Number(amount), reason });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm mx-4 rounded-xl border border-[#383838] bg-[#2C2C2C] shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#383838]">
          <h2 className="text-sm font-semibold text-white">Adjust Credits</h2>
          <button onClick={onClose} className="text-[#808080] hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#808080]">
            User: <span className="text-white">{user.name}</span> · Current balance:{' '}
            <span className="text-[#0C8CE9]">{formatCredits(user.creditBalance)}</span>
          </p>
          <div>
            <label className="block text-xs text-[#B3B3B3] mb-1">Amount (positive = add, negative = deduct)</label>
            <input required type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white focus:outline-none focus:border-[#0C8CE9]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#B3B3B3] mb-1">Reason *</label>
            <input required value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer support refund"
              className="w-full h-8 px-3 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9]"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 h-9 rounded-md border border-[#383838] text-xs text-[#B3B3B3] hover:bg-[#383838] transition-colors">Cancel</button>
            <button type="submit" disabled={adjustCredits.isPending} className="flex-1 h-9 rounded-md bg-[#0C8CE9] text-white text-xs font-medium hover:bg-[#0D99FF] disabled:opacity-50 transition-colors">
              {adjustCredits.isPending ? 'Saving...' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Admin user management table with search and credit adjustment */
export function UserManagementTable() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminUsers(search ? { search } : undefined);
  const updateRole = useUpdateUserRole();
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);

  const users = data?.data ?? [];

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-8 pl-9 pr-4 rounded-md bg-[#2C2C2C] border border-[#383838] text-xs text-white placeholder:text-[#808080] focus:outline-none focus:border-[#0C8CE9] transition-colors"
        />
      </div>

      <div className="rounded-lg border border-[#383838] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#2C2C2C] border-b border-[#383838]">
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">User</th>
              <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Role</th>
              <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium">Balance</th>
              <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium hidden md:table-cell">Joined</th>
              <th className="px-4 py-2.5 w-24" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#383838]">
                  <td className="px-4 py-3" colSpan={5}>
                    <div className="h-4 rounded skeleton w-full" />
                  </td>
                </tr>
              ))
            ) : users.map((user: User) => (
              <tr key={user.id} className="border-b border-[#383838] last:border-0 hover:bg-[#2C2C2C] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-xs font-medium text-white">{user.name}</div>
                  <div className="text-[11px] text-[#666666]">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center gap-1 text-xs ${user.role === UserRole.ADMIN ? 'text-[#A259FF]' : 'text-[#808080]'}`}>
                    {user.role === UserRole.ADMIN ? <ShieldCheck size={12} /> : <Shield size={12} />}
                    {user.role}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-xs text-[#0C8CE9] font-semibold">
                  {formatCredits(user.creditBalance)}
                </td>
                <td className="px-4 py-3 text-right text-[11px] text-[#666666] hidden md:table-cell">
                  {formatDateTime(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setAdjustingUser(user)}
                      className="h-6 px-2 rounded text-[11px] text-[#0C8CE9] hover:bg-[rgba(12,140,233,0.12)] transition-colors"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={() => updateRole.mutate({
                        id: user.id,
                        role: user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN,
                      })}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#808080] hover:text-white hover:bg-[#383838] transition-colors"
                      title="Toggle role"
                    >
                      <Settings2 size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && users.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-[#808080]">No users found</div>
        )}
      </div>

      {adjustingUser && (
        <AdjustCreditsDialog user={adjustingUser} onClose={() => setAdjustingUser(null)} />
      )}
    </>
  );
}
