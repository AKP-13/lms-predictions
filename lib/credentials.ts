export const MIN_PASSWORD_LENGTH = 12;

export function passwordLengthError(password: string): string | null {
  // Count characters, not UTF-16 code units.
  if ([...password].length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

// One hash suffix per line, each followed by a colon and a count.
export type BreachLookup =
  | { answered: true; body: string }
  | { answered: false };

const BREACHED_PASSWORD =
  'This password has appeared in a data breach. Choose a different one.';

// A lookup that did not answer accepts the password.
export function breachLookupError(
  hashSuffix: string,
  lookup: BreachLookup
): string | null {
  if (!lookup.answered) return null;
  const wanted = hashSuffix.toUpperCase();
  const breached = lookup.body
    .toUpperCase()
    .split('\n')
    .some((line) => line.split(':')[0].trim() === wanted);
  return breached ? BREACHED_PASSWORD : null;
}

// One local part and one domain; no quotes, commas, or whitespace.
const EMAIL_SHAPE = /^[^\s@",]+@[^\s@",]+$/;

// Keep in step with the Auth.js email normaliser. Null means Auth.js rejects or rewrites the shape.
export function normaliseEmail(email: string): string | null {
  const normalised = email.toLowerCase().trim();
  return EMAIL_SHAPE.test(normalised) ? normalised : null;
}

export type SignInUser = {
  passwordHash: string | null;
  emailVerified: Date | null;
};

export type SignInDecision<User extends SignInUser> =
  | { allow: true; user: User }
  | { allow: false; reason: string };

// One reason for every refusal, so nothing reveals whether an email has an account.
const SIGN_IN_FAILED =
  'Sign in failed. Check your email and password, and that you have verified your email address.';

export function decideSignIn<User extends SignInUser>(
  user: User | null,
  passwordMatches: boolean
): SignInDecision<User> {
  if (!user?.passwordHash || !user.emailVerified || !passwordMatches) {
    return { allow: false, reason: SIGN_IN_FAILED };
  }
  return { allow: true, user };
}

export const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export const MAX_ATTEMPTS_PER_EMAIL = 5;

// One address serves many users, so it gets more room.
export const MAX_ATTEMPTS_PER_IP = 30;

export type RecentAttempts = {
  byEmail: Date[];
  byIp: Date[];
};

// Distinct from SIGN_IN_FAILED: a refusal to try reveals nothing about the account.
const RATE_LIMITED =
  'Too many failed sign-in attempts. Wait a few minutes, then try again.';

// Returns a message to show the user, or null to check the password.
export function rateLimitError(
  attempts: RecentAttempts,
  now: Date
): string | null {
  const start = now.getTime() - ATTEMPT_WINDOW_MS;
  const inWindow = (attemptedAt: Date) => attemptedAt.getTime() >= start;
  const overLimit =
    attempts.byEmail.filter(inWindow).length >= MAX_ATTEMPTS_PER_EMAIL ||
    attempts.byIp.filter(inWindow).length >= MAX_ATTEMPTS_PER_IP;
  return overLimit ? RATE_LIMITED : null;
}

// The first entry is the client; the rest are the proxies it passed through.
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for') ?? '';
  const first = forwarded.split(',')[0].trim();
  return first || null;
}
