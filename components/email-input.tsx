import { LabelledField } from '@/components/labelled-field';
import { Input } from '@/components/ui/input';

export function EmailInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <LabelledField label="Email">
      <Input
        type="email"
        name="email"
        autoComplete="email"
        defaultValue={defaultValue}
        required
      />
    </LabelledField>
  );
}
