import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Developers: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/docs/api' },
    { label: 'GitHub', href: 'https://github.com/nexusui' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

/** Footer with navigation links and social icons */
export function FooterSection() {
  return (
    <footer className="border-t border-[#383838] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-[#0C8CE9] flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="text-white font-semibold text-sm">NexusUI</span>
            </div>
            <p className="text-xs text-[#808080] leading-relaxed">
              AI-powered design system generation for modern teams.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-3">
                {section}
              </h4>
              <ul className="space-y-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#B3B3B3] hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#383838]">
          <p className="text-xs text-[#666666]">
            © {new Date().getFullYear()} NexusUI. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/nexusui"
              className="text-[#666666] hover:text-[#B3B3B3] transition-colors duration-150"
              aria-label="GitHub"
            >
              <Github size={16} />
            </Link>
            <Link
              href="https://twitter.com/nexusui"
              className="text-[#666666] hover:text-[#B3B3B3] transition-colors duration-150"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
