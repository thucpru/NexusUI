interface CreditBalanceBarProps {
  balance: number;
  /** Max credits for percentage calculation (defaults to 1000 for display) */
  maxCredits?: number;
}

/** Visual credit balance progress bar — green/yellow/red by percentage */
export function CreditBalanceBar({ balance, maxCredits = 1000 }: CreditBalanceBarProps) {
  const pct = Math.min(100, (balance / maxCredits) * 100);

  let barColor = '#14AE5C'; // green
  if (pct <= 20) barColor = '#F24822'; // red
  else if (pct <= 40) barColor = '#F2994A'; // orange

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#808080]">Balance</span>
        <span className="text-xs font-semibold text-white">
          {balance.toLocaleString()} credits
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#383838] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}
