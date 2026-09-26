'use server';

import { signIn } from '@/lib/auth';
import type { CredentialsFormState } from '@/lib/form-state';
import { registerUser } from '@/lib/registration';

export async function signUp(
  _prevState: CredentialsFormState,
  formData: FormData
): Promise<CredentialsFormState> {
  const rawEmail = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const registration = await registerUser(rawEmail, password);
  if (!registration.ok) {
    return { error: registration.error, email: rawEmail };
  }
  // Send the magic link for an existing email too. signIn redirects.
  return signIn('resend', { email: registration.email, redirectTo: '/' });
}
