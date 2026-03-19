import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserRole } from '@nexusui/shared';

/** Admin layout — server-side role check before rendering any admin page */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Role stored in Clerk public metadata
  const role = (sessionClaims?.['publicMetadata'] as { role?: UserRole } | undefined)?.['role'];
  if (role !== UserRole.ADMIN) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
