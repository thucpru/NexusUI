import Link from 'next/link';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

/** Hero section — primary landing page CTA */
export function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-4xl mx-auto">
      {/* AI badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#A259FF]/30 bg-[rgba(162,89,255,0.08)] mb-8">
        <Sparkles size={14} className="text-[#A259FF]" />
        <span className="text-xs font-semibold text-[#A259FF] tracking-wide uppercase">
          AI-Powered Design Systems
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-[3rem] font-bold leading-[1.1] text-white mb-6 max-w-3xl">
        Turn your Figma tokens into{' '}
        <span className="text-[#0C8CE9]">production code</span>
      </h1>

      <p className="text-[1rem] text-[#B3B3B3] leading-relaxed max-w-xl mb-10">
        Connect your Figma design system once. Generate React, Vue, or Svelte components
        with consistent tokens, zero drift. Ship design systems that scale.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-[#0C8CE9] text-white font-medium text-sm hover:bg-[#0D99FF] transition-colors duration-150"
        >
          Get started free
          <ArrowRight size={16} />
        </Link>
        <Link
          href="#features"
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md border border-[#383838] text-[#B3B3B3] font-medium text-sm hover:bg-[#383838] hover:text-white transition-colors duration-150"
        >
          <Zap size={16} />
          See how it works
        </Link>
      </div>

      {/* Trust indicators */}
      <p className="mt-8 text-xs text-[#666666]">
        No credit card required &nbsp;·&nbsp; 50 free credits on signup &nbsp;·&nbsp; Pay as you go
      </p>

      {/* Dashboard preview placeholder */}
      <div className="mt-16 w-full max-w-3xl rounded-xl border border-[#383838] bg-[#2C2C2C] overflow-hidden shadow-xl">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#383838]">
          <div className="w-3 h-3 rounded-full bg-[#F24822] opacity-70" />
          <div className="w-3 h-3 rounded-full bg-[#F2994A] opacity-70" />
          <div className="w-3 h-3 rounded-full bg-[#14AE5C] opacity-70" />
          <span className="ml-3 text-xs text-[#666666] font-mono">nexusui.app/dashboard</span>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#383838] skeleton" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded skeleton" style={{ width: `${60 + i * 12}%` }} />
                <div className="h-2.5 rounded skeleton" style={{ width: `${40 + i * 8}%` }} />
              </div>
              <div className="w-16 h-6 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
