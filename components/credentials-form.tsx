'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { Input } from '@/components/ui/input';
import type { CredentialsFormState } from '@/lib/form-state';

const INITIAL_STATE: CredentialsFormState = { error: null, email: '' };

// One form for both credentials paths: sign-in and sign-up.
export function CredentialsForm({
  action,
  passwordPlaceholder,
  passwordAutoComplete,
  label
}: {
  action: (
    state: CredentialsFormState,
    formData: FormData
  ) => Promise<CredentialsFormState>;
  passwordPlaceholder: string;
  passwordAutoComplete: 'current-password' | 'new-password';
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

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
        placeholder={passwordPlaceholder}
        autoComplete={passwordAutoComplete}
        required
      />
      <FormError message={state.error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {label}
      </Button>
    </form>
  );
}
