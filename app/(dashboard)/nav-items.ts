import type { Session } from 'next-auth';
import {
  CalendarRange,
  Home,
  Table,
  UserCog,
  type LucideIcon
} from 'lucide-react';
import { desktopViewHref } from './home-tabs';

export type NavEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function navItems(
  session: Session | null,
  surface: 'phone' | 'desktop'
): NavEntry[] {
  const items: NavEntry[] = [{ href: '/', label: 'Home', icon: Home }];
  // The phone has Planner and Results as tabs on the home page, so its menu does not repeat them.
  if (surface === 'desktop') {
    items.push(
      {
        href: desktopViewHref('planner'),
        label: 'Planner',
        icon: CalendarRange
      },
      { href: desktopViewHref('results'), label: 'Results', icon: Table }
    );
  }
  if (session) {
    items.push({ href: '/account', label: 'Account', icon: UserCog });
  }
  return items;
}
