import type { Session } from 'next-auth';
import { Home, Table, UserCog, type LucideIcon } from 'lucide-react';

export type NavEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
  // 'account' items sit next to the sign-in or sign-out control.
  group: 'pages' | 'account';
};

export function navItems(session: Session | null): NavEntry[] {
  const items: NavEntry[] = [
    { href: '/', label: 'Home', icon: Home, group: 'pages' },
    { href: '/results', label: 'Results', icon: Table, group: 'pages' }
  ];
  if (session) {
    items.push({
      href: '/account',
      label: 'Account',
      icon: UserCog,
      group: 'account'
    });
  }
  return items;
}
