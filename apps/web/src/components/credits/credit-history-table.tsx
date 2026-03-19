import type { CreditLedger } from '@nexusui/shared';
import { OperationType } from '@nexusui/shared';
import { formatDateTime, formatCredits } from '@nexusui/shared';
import { ArrowDownLeft, ArrowUpRight, Settings, RefreshCw } from 'lucide-react';

interface CreditHistoryTableProps {
  entries: CreditLedger[];
  isLoading: boolean;
}

const OP_CONFIG = {
  [OperationType.PURCHASE]: {
    icon: ArrowUpRight,
    label: 'Purchase',
    color: 'text-[#14AE5C]',
    prefix: '+',
  },
  [OperationType.AI_GENERATION]: {
    icon: ArrowDownLeft,
    label: 'Generation',
    color: 'text-[#F24822]',
    prefix: '-',
  },
  [OperationType.ADMIN_ADJUSTMENT]: {
    icon: Settings,
    label: 'Adjustment',
    color: 'text-[#F2994A]',
    prefix: '',
  },
  [OperationType.REFUND]: {
    icon: RefreshCw,
    label: 'Refund',
    color: 'text-[#14AE5C]',
    prefix: '+',
  },
};

/** Paginated credit ledger table */
export function CreditHistoryTable({ entries, isLoading }: CreditHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#383838] overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#383838]">
            <div className="w-6 h-6 rounded-full skeleton" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/3 rounded skeleton" />
              <div className="h-2.5 w-1/4 rounded skeleton" />
            </div>
            <div className="h-4 w-16 rounded skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 rounded-lg border border-[#383838] bg-[#2C2C2C]">
        <p className="text-sm text-[#808080]">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#383838] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#383838] bg-[#2C2C2C]">
            <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Type</th>
            <th className="text-left px-4 py-2.5 text-xs text-[#808080] font-medium">Description</th>
            <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium">Amount</th>
            <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium">Balance</th>
            <th className="text-right px-4 py-2.5 text-xs text-[#808080] font-medium hidden sm:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const cfg = OP_CONFIG[entry.operationType];
            const Icon = cfg.icon;
            const isPositive = entry.amount > 0;

            return (
              <tr
                key={entry.id}
                className="border-b border-[#383838] last:border-0 hover:bg-[#2C2C2C] transition-colors duration-100"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#383838] flex items-center justify-center">
                      <Icon size={12} className={cfg.color} />
                    </div>
                    <span className="text-xs text-[#B3B3B3]">{cfg.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[#808080] max-w-[200px] truncate">
                  {entry.description}
                </td>
                <td className={`px-4 py-3 text-right text-xs font-semibold ${isPositive ? 'text-[#14AE5C]' : 'text-[#F24822]'}`}>
                  {isPositive ? '+' : ''}{formatCredits(entry.amount)}
                </td>
                <td className="px-4 py-3 text-right text-xs text-[#808080]">
                  {formatCredits(entry.balanceAfter)}
                </td>
                <td className="px-4 py-3 text-right text-[11px] text-[#666666] hidden sm:table-cell">
                  {formatDateTime(entry.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
