import { LabelledField } from '@/components/labelled-field';
import { Input } from '@/components/ui/input';
import { MIN_PASSWORD_LENGTH } from '@/lib/credentials';

// A new password meets the length rule here. A current password does not:
// `/login` answers every bad sign-in with one generic message instead.
export function PasswordInput({
  name,
  label,
  autoComplete
}: {
  name: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
}) {
  const isNew = autoComplete === 'new-password';

  return (
    <LabelledField label={label}>
      <Input
        type="password"
        name={name}
        autoComplete={autoComplete}
        minLength={isNew ? MIN_PASSWORD_LENGTH : undefined}
        required
      />
    </LabelledField>
  );
}
