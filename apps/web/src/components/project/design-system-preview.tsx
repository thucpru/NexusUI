import { Palette } from 'lucide-react';
import type { DesignSystem } from '@nexusui/shared';

interface DesignSystemPreviewProps {
  designSystem?: DesignSystem | null;
}

/** Visual preview of design system color and typography tokens */
export function DesignSystemPreview({ designSystem }: DesignSystemPreviewProps) {
  if (!designSystem) {
    return (
      <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={15} className="text-[#808080]" />
          <h3 className="text-sm font-semibold text-white">Design System</h3>
        </div>
        <div className="flex flex-col items-center py-10 text-center">
          <Palette size={28} className="text-[#444444] mb-3" />
          <p className="text-sm text-[#808080]">No design system linked</p>
          <p className="text-xs text-[#666666] mt-1">Connect Figma to import tokens</p>
        </div>
      </div>
    );
  }

  // Extract color tokens
  const colorTokens = (designSystem.tokens.colors ?? []).slice(0, 8);

  return (
    <div className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette size={15} className="text-[#A259FF]" />
          <h3 className="text-sm font-semibold text-white">{designSystem.name}</h3>
        </div>
        <span className="text-[11px] text-[#666666]">
          v{designSystem.version}
        </span>
      </div>

      {/* Color swatches */}
      {colorTokens.length > 0 && (
        <div>
          <p className="text-[11px] text-[#808080] mb-2 uppercase tracking-wider font-semibold">Colors</p>
          <div className="flex flex-wrap gap-2">
            {colorTokens.map((token) => (
              <div key={token.name} className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded border border-[rgba(255,255,255,0.1)]"
                  style={{ background: token.value }}
                  title={`${token.name}: ${token.value}`}
                />
                <span className="text-[11px] text-[#808080] font-mono">{token.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
