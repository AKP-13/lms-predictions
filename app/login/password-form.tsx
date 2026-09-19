'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInWithPassword, SignInState } from './actions';

const INITIAL_STATE: SignInState = { error: null, email: '' };

export function PasswordSignInForm() {
  const [state, formAction, pending] = useActionState(
    signInWithPassword,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        type="email"
        name="email"
        placeholder="Email"
        autoComplete="email"
        required
        defaultValue={state.email}
      />
      <Input
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="current-password"
        required
      />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        Sign in
      </Button>
    </form>
  );
}
