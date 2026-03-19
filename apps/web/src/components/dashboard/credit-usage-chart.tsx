'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useCreditLedger } from '@/lib/hooks/use-credit-balance';
import { OperationType } from '@nexusui/shared';

/** Custom tooltip for the credit usage bar chart */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const first = payload[0];
  return (
    <div className="px-3 py-2 rounded-md bg-[#383838] border border-[#4D4D4D] text-xs">
      <p className="text-[#B3B3B3] mb-1">{label}</p>
      <p className="text-white font-semibold">{first?.value} credits</p>
    </div>
  );
}

/** Credit consumption bar chart — groups ledger entries by day */
export function CreditUsageChart() {
  const { data, isLoading } = useCreditLedger();

  if (isLoading) {
    return (
      <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
        <div className="h-3 w-32 rounded skeleton mb-4" />
        <div className="h-40 rounded skeleton" />
      </div>
    );
  }

  // Aggregate AI_GENERATION entries by day (last 7 days)
  const ledger = data?.data ?? [];
  const dayMap: Record<string, number> = {};
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    dayMap[key] = 0;
  }

  for (const entry of ledger) {
    if (entry.operationType !== OperationType.AI_GENERATION) continue;
    const d = new Date(entry.createdAt);
    const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    if (key in dayMap) {
      dayMap[key] = (dayMap[key] ?? 0) + Math.abs(entry.amount);
    }
  }

  const chartData = Object.entries(dayMap).map(([date, used]) => ({ date, used }));

  return (
    <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
      <h3 className="text-sm font-semibold text-white mb-4">Credit Usage (7 days)</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={20}>
          <CartesianGrid vertical={false} stroke="#333333" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#808080', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#808080', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="used" fill="#0C8CE9" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
