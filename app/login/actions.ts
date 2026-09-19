'use server';

import { SignInRefused, signIn } from '@/lib/auth';

export type SignInState = { error: string | null; email: string };

export async function signInWithPassword(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
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
