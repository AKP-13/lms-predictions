import { Input } from '@/components/ui/input';
import { MIN_PASSWORD_LENGTH } from '@/lib/credentials';

// A new password meets the length rule here. A current password does not:
// `/login` answers every bad sign-in with one generic message instead.
export function PasswordInput({
  name,
  placeholder,
  autoComplete
}: {
  name: string;
  placeholder: string;
  autoComplete: 'current-password' | 'new-password';
}) {
  const isNew = autoComplete === 'new-password';

  return (
    <Input
      type="password"
      name={name}
      placeholder={placeholder}
      autoComplete={autoComplete}
      minLength={isNew ? MIN_PASSWORD_LENGTH : undefined}
      required
    />
  );
}
