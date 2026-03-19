import Link from 'next/link';
import { Check } from 'lucide-react';

const PACKAGES = [
  {
    name: 'Starter',
    credits: 100,
    priceUsd: 5,
    description: 'Try NexusUI with a small project.',
    perGeneration: '~10 generations',
    features: [
      'All AI models',
      'React & Vue output',
      'GitHub sync',
      'Priority support',
    ],
    highlight: false,
  },
  {
    name: 'Pro',
    credits: 500,
    priceUsd: 20,
    description: 'For active teams shipping regularly.',
    perGeneration: '~50 generations',
    features: [
      'Everything in Starter',
      'All frameworks (Svelte, HTML)',
      'Design system versioning',
      'Custom model config',
    ],
    highlight: true,
  },
  {
    name: 'Team',
    credits: 2000,
    priceUsd: 70,
    description: 'For large design systems at scale.',
    perGeneration: '~200 generations',
    features: [
      'Everything in Pro',
      'Bulk generation',
      'Analytics & reporting',
      'Dedicated support',
    ],
    highlight: false,
  },
];

/** Pricing section — credit packages, NOT subscription tiers */
export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-20 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-[1.5rem] font-semibold text-white mb-3">Simple, pay-as-you-go pricing</h2>
        <p className="text-sm text-[#B3B3B3] max-w-sm mx-auto">
          Buy credits once. No subscriptions, no monthly charges. Credits never expire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            className={`
              relative p-5 rounded-xl border transition-colors duration-150
              ${pkg.highlight
                ? 'border-[#0C8CE9] bg-[rgba(12,140,233,0.06)]'
                : 'border-[#383838] bg-[#2C2C2C] hover:border-[#4D4D4D]'
              }
            `}
          >
            {pkg.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-0.5 rounded-full bg-[#0C8CE9] text-white text-xs font-semibold">
                  Most popular
                </span>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-[1rem] font-semibold text-white mb-1">{pkg.name}</h3>
              <p className="text-xs text-[#808080]">{pkg.description}</p>
            </div>

            <div className="mb-1">
              <span className="text-3xl font-bold text-white">${pkg.priceUsd}</span>
              <span className="text-sm text-[#808080] ml-1">one-time</span>
            </div>
            <div className="mb-5">
              <span className="text-[#0C8CE9] font-semibold text-sm">
                {pkg.credits.toLocaleString()} credits
              </span>
              <span className="text-[#666666] text-xs ml-2">· {pkg.perGeneration}</span>
            </div>

            <ul className="space-y-2 mb-6">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#B3B3B3]">
                  <Check size={14} className="text-[#14AE5C] shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className={`
                block w-full text-center h-9 leading-9 rounded-md text-sm font-medium transition-colors duration-150
                ${pkg.highlight
                  ? 'bg-[#0C8CE9] text-white hover:bg-[#0D99FF]'
                  : 'border border-[#383838] text-[#B3B3B3] hover:bg-[#383838] hover:text-white'
                }
              `}
            >
              Get started
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[#666666] mt-8">
        Need more? Contact us for volume pricing.&nbsp;
        <Link href="mailto:hello@nexusui.app" className="text-[#0C8CE9] hover:underline">
          hello@nexusui.app
        </Link>
      </p>
    </section>
  );
}
