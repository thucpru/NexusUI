import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { QueryProvider } from './query-provider';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NexusUI — AI-Powered Design System Generator',
    template: '%s | NexusUI',
  },
  description:
    'Generate production-ready UI components from your Figma design system with AI. Connect once, ship faster.',
  keywords: ['design system', 'AI', 'Figma', 'React', 'component generation'],
  openGraph: {
    type: 'website',
    title: 'NexusUI — AI-Powered Design System Generator',
    description: 'Generate production-ready UI components from your Figma design system.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="dark" className={inter.variable}>
        <body className="bg-bg-primary text-text-primary font-sans antialiased">
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
