import Link from 'next/link';
import { AuthCard } from '@/components/auth-card';
import { MagicLinkForm } from '@/components/magic-link-form';
import { FORGOTTEN_PASSWORD_DESTINATION } from '@/lib/credentials';

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="We email you a link. It signs you in and takes you to the form where you choose a new password."
      footer={
        <p className="text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      }
    >
      <MagicLinkForm
        label="Email me a link"
        redirectTo={FORGOTTEN_PASSWORD_DESTINATION}
      />
    </AuthCard>
  );
}
