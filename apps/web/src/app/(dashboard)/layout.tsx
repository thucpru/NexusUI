import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SidebarNavigation } from '@/components/layout/sidebar-navigation';
import { TopbarNavigation } from '@/components/layout/topbar-navigation';

/** Dashboard shell layout — requires authentication */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#1E1E1E]">
      <SidebarNavigation />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopbarNavigation />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
