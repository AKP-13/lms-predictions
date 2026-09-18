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
