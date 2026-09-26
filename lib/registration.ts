import 'server-only';

import { normaliseEmail } from '@/lib/credentials';
import { enrolInDefaultLeague } from '@/lib/leagues';
import { newPasswordError } from '@/lib/passwords';
import { createUserWithPassword } from '@/lib/users';

export type Registration =
  | { ok: true; email: string }
  | { ok: false; error: string };

// Everything sign-up does before the verification email. The action adds that.
export async function registerUser(
  rawEmail: string,
  password: string
): Promise<Registration> {
  const email = normaliseEmail(rawEmail);
  if (!email) {
    return { ok: false, error: 'Enter a valid email address.' };
  }

  const passwordError = await newPasswordError(password);
  if (passwordError) {
    return { ok: false, error: passwordError };
  }

  const userId = await createUserWithPassword(email, password);
  if (userId !== null) {
    await enrolInDefaultLeague(userId);
  }
  return { ok: true, email };
}
