'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUp, SignUpState } from './actions';
import { MIN_PASSWORD_LENGTH } from '@/lib/credentials';

const INITIAL_STATE: SignUpState = { error: null, email: '' };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, INITIAL_STATE);

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
        placeholder={`Password (${MIN_PASSWORD_LENGTH}+ characters)`}
        autoComplete="new-password"
        required
      />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        Sign up
      </Button>
    </form>
  );
}
