'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { EmailInput } from '@/components/email-input';
import { FormError } from '@/components/form-error';
import { PasswordInput } from '@/components/password-input';
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
      <EmailInput defaultValue={state.email} />
      <PasswordInput
        name="password"
        placeholder={passwordPlaceholder}
        autoComplete={passwordAutoComplete}
      />
      <FormError message={state.error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {label}
      </Button>
    </form>
  );
}
