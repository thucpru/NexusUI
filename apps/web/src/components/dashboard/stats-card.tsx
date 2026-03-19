import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

/** Generic stat metric card for dashboard overview */
export function StatsCard({
  label,
  value,
  change,
  changePositive,
  icon: Icon,
  iconColor = '#0C8CE9',
  iconBg = 'rgba(12,140,233,0.12)',
}: StatsCardProps) {
  return (
    <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#808080] font-medium">{label}</span>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {change && (
        <div className="flex items-center gap-1">
          <span
            className={`text-xs font-medium ${changePositive ? 'text-[#14AE5C]' : 'text-[#F24822]'}`}
          >
            {change}
          </span>
          <span className="text-xs text-[#666666]">vs last month</span>
        </div>
      )}
    </div>
  );
}
