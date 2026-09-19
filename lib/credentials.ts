export const MIN_PASSWORD_LENGTH = 12;

export function passwordLengthError(password: string): string | null {
  // Count characters, not UTF-16 code units.
  if ([...password].length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
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
