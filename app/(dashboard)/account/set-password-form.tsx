'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form-error';
import { PasswordInput } from '@/components/password-input';
import { MIN_PASSWORD_LENGTH } from '@/lib/credentials';
import type { SetPasswordFormState } from '@/lib/form-state';
import { setOwnPassword } from './actions';

const INITIAL_STATE: SetPasswordFormState = { error: null, done: false };

export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    setOwnPassword,
    INITIAL_STATE
  );
  // Hides the last result once the user types again.
  const [edited, setEdited] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.done) form.current?.reset();
  }, [state.done]);

  return (
    <form
      ref={form}
      action={(formData) => {
        setEdited(false);
        formAction(formData);
      }}
      onInput={() => setEdited(true)}
      className="flex flex-col gap-4"
    >
      <PasswordInput
        name="password"
        label={`New password (${MIN_PASSWORD_LENGTH}+ characters)`}
        autoComplete="new-password"
      />
      <PasswordInput
        name="confirmation"
        label="New password again"
        autoComplete="new-password"
      />
      <FormError message={edited ? null : state.error} />
      {!edited && state.done && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm font-medium text-green-700"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Your password is set. You can sign in with it from now on.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Set password'}
      </Button>
    </form>
  );
}
