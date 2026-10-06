'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Session } from 'next-auth';
import { cn } from '@/lib/utils';
import { navItems } from './nav-items';
import { desktopViewHref, toDesktopView } from './home-tabs';
import { authControl } from './auth-buttons';

const PILL_CLASSES =
  'flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-[1.125rem] text-sm font-extrabold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

// The href of the item that matches the path and the home page tab.
function currentHref(pathname: string, tab: string | null) {
  return pathname === '/' ? desktopViewHref(toDesktopView(tab)) : pathname;
}

export function TopBar({ session }: { session: Session | null }) {
  const current = currentHref(usePathname(), useSearchParams().get('tab'));
  const auth = authControl(session);

  return (
    <header className="sticky top-0 z-30 hidden h-[4.75rem] grid-cols-[1fr_auto_1fr] items-center gap-4 bg-card px-6 shadow-card md:grid xl:px-12">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="flex size-10 shrink-0 items-center justify-center rounded-[0.875rem] bg-primary text-[0.8125rem] font-extrabold tracking-[0.02em] text-primary-foreground"
        >
          LPS
        </Link>
        {/* Too wide for the bar below lg. */}
        <div className="hidden min-w-0 truncate text-lg font-extrabold leading-[1.375rem] lg:block">
          Last Player Standing
        </div>
      </div>

      <nav
        aria-label="Main"
        className="flex items-center gap-1 rounded-full bg-chip p-1"
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
            <Icon className="size-4" strokeWidth={2.25} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex justify-end">
        <button
          onClick={auth.onClick}
          className={cn(PILL_CLASSES, 'hover:bg-chip')}
        >
          <auth.Icon className="size-4" strokeWidth={2.25} />
          {auth.label}
        </button>
      </div>
    </header>
  );
}
