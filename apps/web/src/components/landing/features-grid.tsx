import { GitBranch, Sparkles, Palette, Code2, Zap, Shield } from 'lucide-react';

const FEATURES = [
  {
    icon: GitBranch,
    title: 'GitHub Sync',
    description:
      'Connect your repo and push generated components directly. Two-way sync keeps code and tokens in lockstep.',
    accent: false,
  },
  {
    icon: Sparkles,
    title: 'AI Generation',
    description:
      'Choose from Claude, GPT-4o, Gemini, and more. Each model targets your design tokens precisely — no hallucinated styles.',
    accent: true, // AI feature — purple
  },
  {
    icon: Palette,
    title: 'Design Token Extraction',
    description:
      'Import color, typography, and spacing tokens directly from Figma. Single source of truth, automatically.',
    accent: false,
  },
  {
    icon: Code2,
    title: 'Multi-Framework Output',
    description:
      'Generate React, Vue, Svelte, or plain HTML. Same design system, every framework your team uses.',
    accent: false,
  },
  {
    icon: Zap,
    title: 'Instant Preview',
    description:
      'See a live render of generated components before committing. Catch drift before it ships.',
    accent: false,
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Admin controls for model registry, pricing, and user management. Keep your platform secure and auditable.',
    accent: false,
  },
];

/** Features grid — 3-column on desktop, 1-column on mobile */
export function FeaturesGrid() {
  return (
    <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-[1.5rem] font-semibold text-white mb-3">
          Everything a design system team needs
        </h2>
        <p className="text-[#B3B3B3] text-sm max-w-md mx-auto">
          From Figma to production in minutes. No manual token wrangling, no stale docs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, description, accent }) => (
          <div
            key={title}
            className="p-5 rounded-lg border border-[#383838] bg-[#2C2C2C] hover:border-[#4D4D4D] transition-colors duration-150"
          >
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center mb-4"
              style={{
                background: accent
                  ? 'rgba(162,89,255,0.12)'
                  : 'rgba(12,140,233,0.12)',
              }}
            >
              <Icon
                size={18}
                style={{ color: accent ? '#A259FF' : '#0C8CE9' }}
              />
            </div>
            <h3 className="text-[1rem] font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-[#B3B3B3] leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
