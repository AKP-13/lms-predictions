'use client';

import type { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { LogIn, LogOut } from 'lucide-react';

function authControl(session: Session | null) {
  return session
    ? {
        label: 'Sign out',
        Icon: LogOut,
        onClick: () => signOut({ redirectTo: '/' })
      }
    : { label: 'Sign in', Icon: LogIn, onClick: () => signIn() };
}

// The icon-only control in the desktop sidebar.
const AuthButtons = ({ session }: { session: Session | null }) => {
  const { label, Icon, onClick } = authControl(session);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
};

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

export default AuthButtons;
