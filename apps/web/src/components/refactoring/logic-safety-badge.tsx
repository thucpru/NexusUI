import type { LogicSafety } from '@nexusui/shared';
import { LOGIC_SAFETY_LABELS } from '@nexusui/shared';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface LogicSafetyBadgeProps {
  safety: LogicSafety;
  showLabel?: boolean;
}

const SAFETY_CONFIG: Record<LogicSafety, {
  color: string;
  bg: string;
  border: string;
  icon: React.ElementType;
}> = {
  SAFE: {
    color: 'text-[#14AE5C]',
    bg: 'bg-[rgba(20,174,92,0.12)]',
    border: 'border-[rgba(20,174,92,0.25)]',
    icon: ShieldCheck,
  },
  RISKY: {
    color: 'text-[#F5A623]',
    bg: 'bg-[rgba(245,166,35,0.12)]',
    border: 'border-[rgba(245,166,35,0.25)]',
    icon: ShieldAlert,
  },
  MANUAL_REVIEW: {
    color: 'text-[#F24822]',
    bg: 'bg-[rgba(242,72,34,0.12)]',
    border: 'border-[rgba(242,72,34,0.25)]',
    icon: ShieldX,
  },
};

/** Badge showing logic safety level for a component refactoring */
export function LogicSafetyBadge({ safety, showLabel = true }: LogicSafetyBadgeProps) {
  const config = SAFETY_CONFIG[safety];
  const Icon = config.icon;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-medium border',
        config.color, config.bg, config.border,
      ].join(' ')}
    >
      <Icon size={11} />
      {showLabel && LOGIC_SAFETY_LABELS[safety]}
    </span>
  );
}
