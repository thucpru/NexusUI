'use client';

import { UserButton } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

/** Maps route paths to readable page titles */
function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard' || pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/projects/') && pathname.split('/').length > 2) return 'Project';
  if (pathname === '/projects') return 'Projects';
  if (pathname === '/settings/credits') return 'Credits';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/admin/models') return 'AI Models';
  if (pathname === '/admin/packages') return 'Credit Packages';
  if (pathname === '/admin/analytics') return 'Analytics';
  if (pathname === '/admin/users') return 'Users';
  return 'NexusUI';
}

/** Topbar with page title and user actions */
export function TopbarNavigation() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-[#383838] bg-[#1E1E1E] shrink-0">
      <h1 className="text-sm font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notification bell placeholder */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#808080] hover:bg-[#383838] hover:text-white transition-colors duration-150"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* Clerk user button */}
        <UserButton
          appearance={{
            variables: {
              colorPrimary: '#0C8CE9',
              colorBackground: '#2C2C2C',
              colorText: '#FFFFFF',
              borderRadius: '6px',
            },
          }}
        />
      </div>
    </header>
  );
}
