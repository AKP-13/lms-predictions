'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { PanelLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { SheetAuthButton } from './auth-buttons';
import { navItems } from './nav-items';

export function MobileNav({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="sm:max-w-xs"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <nav className="grid gap-6 text-lg font-medium">
            {navItems(session).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={pathname === href ? 'page' : undefined}
                className={clsx(
                  'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                  { 'text-foreground': pathname === href }
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            <SheetAuthButton session={session} />
          </nav>
        </SheetContent>
      </Sheet>

      <Link
        href="/"
        className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Trophy className="h-4 w-4 transition-all group-hover:scale-110" />
        <span className="sr-only">LPS</span>
      </Link>
    </header>
  );
}
