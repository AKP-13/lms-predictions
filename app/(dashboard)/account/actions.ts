'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { newPasswordError } from '@/lib/passwords';
import { setPassword } from '@/lib/users';

export type SetPasswordState = { error: string | null; done: boolean };

const SIGN_IN_AGAIN = 'Your session has expired. Sign in again.';

const MISMATCH = 'The two passwords do not match.';

export async function setOwnPassword(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
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

  const updated = await setPassword(userId, password);
  if (!updated) {
    return { error: SIGN_IN_AGAIN, done: false };
  }
  // The page reads whether a password exists, so it must render again.
  revalidatePath('/account');
  return { error: null, done: true };
}
