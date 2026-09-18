'use server';

import { signIn } from '@/lib/auth';
import { enrolInDefaultLeague } from '@/lib/leagues';
import { createUserWithPassword } from '@/lib/users';
import { normaliseEmail, passwordLengthError } from './signup-utils';

export type SignUpState = { error: string | null; email: string };

export async function signUp(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const rawEmail = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const email = normaliseEmail(rawEmail);
  if (!email) {
    return { error: 'Enter a valid email address.', email: rawEmail };
  }
  const lengthError = passwordLengthError(password);
  if (lengthError) {
    return { error: lengthError, email: rawEmail };
  }

  const userId = await createUserWithPassword(email, password);
  if (userId !== null) {
    await enrolInDefaultLeague(userId);
  }
  // Send the magic link for an existing email too. signIn redirects.
  return signIn('resend', { email, redirectTo: '/' });
}
