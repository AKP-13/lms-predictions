import { Analytics } from '@vercel/analytics/react';
import Providers from './providers';
import { MobileNav } from './mobile-nav';
import { TopBar } from './top-bar';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <Providers>
      <div className="flex min-h-screen w-full flex-col">
        <TopBar session={session} />
        <MobileNav session={session} />
        <main className="items-start gap-2 p-4 md:grid md:gap-4 md:px-6 md:py-6 xl:px-12">
          {children}
        </main>
        <Analytics />
      </div>
    </Providers>
  );
}
