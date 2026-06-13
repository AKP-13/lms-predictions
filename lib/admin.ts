// Identifies the site admin by email. Security rests on the NextAuth
// magic-link session — the email itself is already public (used in
// mailto links), so NEXT_PUBLIC_ exposure is fine.
export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS;
  return (
    !!adminEmail && !!email && email.toLowerCase() === adminEmail.toLowerCase()
  );
}
