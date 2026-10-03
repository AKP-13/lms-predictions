// What a credentials form hands back to useActionState. The email returns so the field refills.
export type CredentialsFormState = { error: string | null; email: string };

// What the set-password form hands back. `done` shows the success note.
export type SetPasswordFormState = { error: string | null; done: boolean };
