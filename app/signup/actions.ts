'use server';

import { signIn } from '@/lib/auth';
import { enrolInDefaultLeague } from '@/lib/leagues';
import { newPasswordError } from '@/lib/passwords';
import { createUserWithPassword } from '@/lib/users';
import { normaliseEmail } from '@/lib/credentials';
import type { CredentialsFormState } from '@/lib/form-state';

export async function signUp(
  _prevState: CredentialsFormState,
  formData: FormData
): Promise<CredentialsFormState> {
  const rawEmail = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const email = normaliseEmail(rawEmail);
  if (!email) {
    return { error: 'Enter a valid email address.', email: rawEmail };
  }
  const passwordError = await newPasswordError(password);
  if (passwordError) {
    return { error: passwordError, email: rawEmail };
  }

  const userId = await createUserWithPassword(email, password);
  if (userId !== null) {
    await enrolInDefaultLeague(userId);
  }
  // Send the magic link for an existing email too. signIn redirects.
  return signIn('resend', { email, redirectTo: '/' });
}
