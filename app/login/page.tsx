import Link from 'next/link';
import { AuthCard, PrivacyNote } from '@/components/auth-card';
import { CredentialsForm } from '@/components/credentials-form';
import { MagicLinkForm } from '@/components/magic-link-form';
import { signInWithPassword } from './actions';

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Use your password, or ask for a magic link by email."
      footer={
        <>
          <p className="text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/signup" className="underline">
              Sign up with a password
            </Link>
          </p>
          <PrivacyNote verb="signing in" />
        </>
      }
    >
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium">With a password</h2>
        <CredentialsForm
          action={signInWithPassword}
          passwordPlaceholder="Password"
          passwordAutoComplete="current-password"
          label="Sign in"
        />
        <p className="text-sm text-muted-foreground">
          <Link href="/forgot-password" className="underline">
            Forgot your password?
          </Link>
        </p>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium">With a magic link</h2>
        <MagicLinkForm
          label="Email me a magic link"
          redirectTo="/"
          variant="outline"
        />
      </section>
    </AuthCard>
  );
}
