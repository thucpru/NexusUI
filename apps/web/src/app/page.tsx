import Link from 'next/link';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { PricingSection } from '@/components/landing/pricing-section';
import { FooterSection } from '@/components/landing/footer-section';

/** Public landing page — marketing, features, pricing, CTA */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[#383838] bg-[#1E1E1E]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0C8CE9] flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="text-white font-semibold text-sm">NexusUI</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-[#B3B3B3] hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-[#B3B3B3] hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="text-sm text-[#B3B3B3] hover:text-white transition-colors">Docs</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="h-8 px-4 text-sm text-[#B3B3B3] hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="h-8 px-4 rounded-md bg-[#0C8CE9] text-white text-sm font-medium flex items-center hover:bg-[#0D99FF] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeaturesGrid />
        <PricingSection />
      </main>

      <FooterSection />
    </div>
  );
}
