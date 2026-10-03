import Link from 'next/link';
import type { Session } from 'next-auth';
import { Trophy } from 'lucide-react';

import { Analytics } from '@vercel/analytics/react';
import Providers from './providers';
import { NavItem } from './nav-item';
import { MobileNav } from './mobile-nav';
import { navItems, type NavEntry } from './nav-items';
import { auth } from '@/lib/auth';
import AuthButtons from './auth-buttons';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav session={session} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <MobileNav session={session} />
          <main className="md:grid items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav({ session }: { session: Session | null }) {
  const items = navItems(session);

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Trophy className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">LPS</span>
        </Link>

        <DesktopNavItems items={items} group="pages" />
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <DesktopNavItems items={items} group="account" />

        <AuthButtons session={session} />
      </nav>
    </aside>
  );
}

function DesktopNavItems({
  items,
  group
}: {
  items: NavEntry[];
  group: NavEntry['group'];
}) {
  return items
    .filter((item) => item.group === group)
    .map(({ href, label, icon: Icon }) => (
      <NavItem key={href} href={href} label={label}>
        <Icon className="h-5 w-5" />
      </NavItem>
    ));
}
