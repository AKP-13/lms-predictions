import 'server-only';

import { passwordBreachError } from '@/lib/breach-check';
import { passwordLengthError } from '@/lib/credentials';

// The length rule runs first, so a bad password never reaches the third party.
export async function newPasswordError(
  password: string
): Promise<string | null> {
  return passwordLengthError(password) ?? (await passwordBreachError(password));
}
