'use client';

import { useAdminStats, useModelUsageStats } from '@/lib/hooks/use-admin';
import type { ModelUsageStats } from '@nexusui/shared';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, Sparkles, CreditCard, TrendingUp } from 'lucide-react';

const COLORS = ['#0C8CE9', '#A259FF', '#14AE5C', '#F2994A', '#F24822'];

function StatBox({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="p-4 rounded-lg border border-[#383838] bg-[#2C2C2C]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#808080]">{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

/** Admin analytics dashboard with revenue, model usage charts */
export function AnalyticsDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: modelUsage, isLoading: modelLoading } = useModelUsageStats();

  if (statsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-lg skeleton" />)}
        </div>
        <div className="h-56 rounded-lg skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Users" value={(stats?.totalUsers ?? 0).toLocaleString()} icon={Users} color="#0C8CE9" />
        <StatBox label="Active (30d)" value={(stats?.activeUsers30d ?? 0).toLocaleString()} icon={TrendingUp} color="#14AE5C" />
        <StatBox label="Generations" value={(stats?.totalGenerations ?? 0).toLocaleString()} icon={Sparkles} color="#A259FF" />
        <StatBox
          label="Revenue"
          value={`$${((stats?.totalRevenue ?? 0) / 100).toFixed(2)}`}
          icon={CreditCard}
          color="#F2994A"
        />
      </div>

      {/* Model usage chart */}
      <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
        <h3 className="text-sm font-semibold text-white mb-4">Model Usage</h3>
        {modelLoading ? (
          <div className="h-40 rounded skeleton" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={modelUsage ?? []} barSize={24}>
              <CartesianGrid vertical={false} stroke="#333333" strokeDasharray="3 3" />
              <XAxis dataKey="modelName" tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#808080', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ background: '#383838', border: '1px solid #4D4D4D', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: '#B3B3B3' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Bar dataKey="totalRequests" name="Requests" fill="#0C8CE9" radius={[3, 3, 0, 0]} />
              <Bar dataKey="totalCreditsConsumed" name="Credits Used" fill="#A259FF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Model distribution pie chart */}
      {(modelUsage ?? []).length > 0 && (
        <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <h3 className="text-sm font-semibold text-white mb-4">Request Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={modelUsage ?? []} dataKey="totalRequests" nameKey="modelName" cx="50%" cy="50%" outerRadius={70}>
                {(modelUsage ?? []).map((_: ModelUsageStats, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] ?? '#0C8CE9'} />
                ))}
              </Pie>
              <Legend formatter={(val) => <span style={{ color: '#B3B3B3', fontSize: 12 }}>{val}</span>} />
              <Tooltip
                contentStyle={{ background: '#383838', border: '1px solid #4D4D4D', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: '#B3B3B3' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Credit summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <p className="text-xs text-[#808080] mb-1">Credits Issued</p>
          <p className="text-lg font-bold text-white">{(stats?.totalCreditsIssued ?? 0).toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <p className="text-xs text-[#808080] mb-1">Credits Consumed</p>
          <p className="text-lg font-bold text-white">{(stats?.totalCreditsConsumed ?? 0).toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#383838] bg-[#2C2C2C]">
          <p className="text-xs text-[#808080] mb-1">Total Projects</p>
          <p className="text-lg font-bold text-white">{(stats?.totalProjects ?? 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
