'use client';

import type { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';

export function authControl(session: Session | null) {
  return session
    ? {
        label: 'Sign out',
        Icon: LogOut,
        onClick: () => signOut({ redirectTo: '/' })
      }
    : { label: 'Sign in', Icon: LogIn, onClick: () => signIn() };
}

// The labelled control in the phone sheet.
export function SheetAuthButton({ session }: { session: Session | null }) {
  const { label, Icon, onClick } = authControl(session);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
