import { Button } from '@/components/ui/button';
import { EmailInput } from '@/components/email-input';
import { signIn } from '@/lib/auth';

// One form for both magic-link paths: sign-in and the forgotten password.
export function MagicLinkForm({
  label,
  redirectTo,
  variant
}: {
  label: string;
  redirectTo: string;
  variant?: 'default' | 'outline';
}) {
  return (
    <form
      action={async (formData) => {
        'use server';
        await signIn('resend', {
          email: String(formData.get('email') ?? ''),
          redirectTo
        });
      }}
      className="flex flex-col gap-4"
    >
      <EmailInput />
      <Button type="submit" variant={variant} size="lg" className="w-full">
        {label}
      </Button>
    </form>
  );
}
