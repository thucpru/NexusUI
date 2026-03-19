import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@nexusui/shared', '@nexusui/ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
    ],
  },
  eslint: {
    // Disable ESLint during build for faster iteration
    ignoreDuringBuilds: true,
  },
  onDemandEntries: {
    // Don't prerender any pages
    maxInactiveAge: 1000 * 60 * 60,
    pagesBufferLength: 0,
  },
  experimental: {
    // App Router is stable in Next 15
  },
};

export default nextConfig;
