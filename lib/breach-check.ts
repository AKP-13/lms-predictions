import 'server-only';

import { createHash } from 'node:crypto';
import { breachLookupError, BreachLookup } from '@/lib/credentials';

const RANGE_URL = 'https://api.pwnedpasswords.com/range/';

// k-anonymity: the service sees this many hash characters and no more.
const PREFIX_LENGTH = 5;

const TIMEOUT_MS = 3000;

// The prefix the service sees, and the suffix that stays here.
export function splitHash(password: string): {
  prefix: string;
  suffix: string;
} {
  const digest = createHash('sha1')
    .update(password, 'utf8')
    .digest('hex')
    .toUpperCase();
  return {
    prefix: digest.slice(0, PREFIX_LENGTH),
    suffix: digest.slice(PREFIX_LENGTH)
  };
}

// Returns a message to show the user, or null to accept the password.
export async function passwordBreachError(
  password: string
): Promise<string | null> {
  const { prefix, suffix } = splitHash(password);
  return breachLookupError(suffix, await lookupRange(prefix));
}

async function lookupRange(prefix: string): Promise<BreachLookup> {
  try {
    const response = await fetch(`${RANGE_URL}${prefix}`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'lms-predictions' },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!response.ok) {
      console.warn(`Breach check did not answer: status ${response.status}`);
      return { answered: false };
    }
    return { answered: true, body: await response.text() };
  } catch (error) {
    console.warn('Breach check did not answer:', error);
    return { answered: false };
  }
}
