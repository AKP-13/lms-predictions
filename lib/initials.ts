// The letters in the account avatar: first and last name, else the email's first letter.
export function initialsFor(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return (email ?? '').charAt(0).toUpperCase();

  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}
