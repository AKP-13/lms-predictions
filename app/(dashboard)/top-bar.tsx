'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Session } from 'next-auth';
import { LpsLogo } from '@/components/lps-logo';
import type { LeagueHeading } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';
import { desktopViewHref, toDesktopView } from './home-tabs';
import { authControl } from './auth-buttons';
import { LeagueTitle } from './league-title';

// Below lg, the pills are narrower and have no icon, so the league name fits.
const PILL_CLASSES =
  'flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-extrabold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:px-[1.125rem]';
const PILL_ICON_CLASSES = 'hidden size-4 lg:block';

// The href of the item that matches the path and the home page tab.
function currentHref(pathname: string, tab: string | null) {
  return pathname === '/' ? desktopViewHref(toDesktopView(tab)) : pathname;
}

export function TopBar({
  session,
  heading
}: {
  session: Session | null;
  heading: LeagueHeading | null;
}) {
  const current = currentHref(usePathname(), useSearchParams().get('tab'));
  const auth = authControl(session);

  return (
    <header className="sticky top-0 z-30 hidden h-[4.75rem] grid-cols-[minmax(0,auto)_1fr_auto] items-center gap-4 bg-card px-6 shadow-card md:grid lg:grid-cols-[1fr_auto_1fr] xl:px-12">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/" className="shrink-0 rounded-[0.875rem]">
          <LpsLogo />
        </Link>
        <LeagueTitle heading={heading} />
      </div>

      <nav
        aria-label="Main"
        className="flex items-center gap-1 justify-self-center rounded-full bg-chip p-1"
      >
        {navItems(session, 'desktop').map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={href === current ? 'page' : undefined}
            className={cn(
              PILL_CLASSES,
              href === current &&
                'bg-primary text-primary-foreground hover:text-primary-foreground'
            )}
          >
            <Icon className={PILL_ICON_CLASSES} strokeWidth={2.25} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex justify-end">
        <button
          onClick={auth.onClick}
          className={cn(PILL_CLASSES, 'hover:bg-chip')}
        >
          <auth.Icon className={PILL_ICON_CLASSES} strokeWidth={2.25} />
          {auth.label}
        </button>
      </div>
    </header>
  );
}
