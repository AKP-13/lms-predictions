import { Input } from '@/components/ui/input';

export function EmailInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <Input
      type="email"
      name="email"
      placeholder="Email"
      autoComplete="email"
      defaultValue={defaultValue}
      required
    />
  );
}
