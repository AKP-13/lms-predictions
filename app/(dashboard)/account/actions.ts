'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { SetPasswordFormState } from '@/lib/form-state';
import { newPasswordError } from '@/lib/passwords';
import { clearAttemptsForEmail } from '@/lib/sign-in-attempts';
import { setPassword } from '@/lib/users';

const SIGN_IN_AGAIN = 'Your session has expired. Sign in again.';

const MISMATCH = 'The two passwords do not match.';

export async function setOwnPassword(
  _prevState: SetPasswordFormState,
  formData: FormData
): Promise<SetPasswordFormState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: SIGN_IN_AGAIN, done: false };
  }

  const password = String(formData.get('password') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');
  if (password !== confirmation) {
    return { error: MISMATCH, done: false };
  }

  const error = await newPasswordError(password);
  if (error) {
    return { error, done: false };
  }

  const email = await setPassword(userId, password);
  if (!email) {
    return { error: SIGN_IN_AGAIN, done: false };
  }
  // A user who forgot the password just made the failed attempts, so the new one
  // must work at once.
  await clearAttemptsForEmail(email);
  // The page reads whether a password exists, so it must render again.
  revalidatePath('/account');
  return { error: null, done: true };
}
