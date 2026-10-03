'use server';

import { SignInRefused, signIn } from '@/lib/auth';
import type { CredentialsFormState } from '@/lib/form-state';

export async function signInWithPassword(
  _prevState: CredentialsFormState,
  formData: FormData
): Promise<CredentialsFormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  try {
    await signIn('credentials', { email, password, redirectTo: '/' });
  } catch (error) {
    if (error instanceof SignInRefused) {
      return { error: error.reason, email };
    }
    // A successful sign-in redirects by throwing. Let it through.
    throw error;
  }
  return { error: null, email };
}
