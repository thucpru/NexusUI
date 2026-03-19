'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  CreditCard,
  Users,
  Sparkles,
  BarChart2,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '@nexusui/shared';
import { CreditBalanceDisplay } from './credit-balance-display';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Credits', href: '/settings/credits', icon: CreditCard },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'AI Models', href: '/admin/models', icon: Sparkles, adminOnly: true },
  { label: 'Packages', href: '/admin/packages', icon: Package, adminOnly: true },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2, adminOnly: true },
  { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
];

/** Sidebar navigation with role-based items. Active state: 2px left blue border + tertiary bg */
export function SidebarNavigation() {
  const pathname = usePathname();
  const { user } = useUser();

  // Read role from Clerk public metadata
  const role = (user?.publicMetadata?.['role'] as UserRole | undefined) ?? UserRole.USER;
  const isAdmin = role === UserRole.ADMIN;

  function NavLink({ item }: { item: NavItem }) {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`
          relative flex items-center gap-3 h-9 px-3 rounded-md text-sm font-medium transition-colors duration-150
          ${isActive
            ? 'bg-[#383838] text-white'
            : 'text-[#B3B3B3] hover:bg-[#383838] hover:text-white'
          }
        `}
      >
        {/* 2px left blue border for active state */}
        {isActive && (
          <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#0C8CE9]" />
        )}
        <Icon size={16} className={isActive ? 'text-[#0C8CE9]' : ''} />
        {item.label}
      </Link>
    );
  }

  return (
    <aside className="flex flex-col w-60 h-full bg-[#1E1E1E] border-r border-[#383838]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-[#383838] shrink-0">
        <div className="w-6 h-6 rounded bg-[#0C8CE9] flex items-center justify-center">
          <span className="text-white text-xs font-bold">N</span>
        </div>
        <span className="text-white font-semibold text-sm">NexusUI</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {/* Admin section — only for ADMIN role */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1">
              <div className="flex items-center gap-1.5 px-3">
                <ShieldCheck size={12} className="text-[#A259FF]" />
                <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </div>
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* Credit balance footer */}
      <div className="px-3 py-4 border-t border-[#383838] shrink-0">
        <CreditBalanceDisplay />
      </div>
    </aside>
  );
}
