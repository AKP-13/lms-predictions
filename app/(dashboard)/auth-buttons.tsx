// AuthButton.tsx
'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { LogIn, LogOut } from 'lucide-react';

const AuthButtons = () => {
  const { data: session } = useSession();

  return session ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => signOut()}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">Logout</TooltipContent>
    </Tooltip>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => signIn()}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        >
          <LogIn className="h-5 w-5" />
          <span className="sr-only">Login</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">Login</TooltipContent>
    </Tooltip>
  );
};

export default AuthButtons;
