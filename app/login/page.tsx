import Link from 'next/link';
import { textLinkClassName } from '@/components/ui/button';
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
          <p className="text-sm font-semibold text-muted-foreground">
            New here?{' '}
            <Link href="/signup" className={textLinkClassName}>
              Sign up with a password
            </Link>
          </p>
          <PrivacyNote verb="signing in" />
        </>
      }
    >
      <section className="flex flex-col gap-4">
        <h2 className="text-[0.9375rem] font-extrabold">With a password</h2>
        <CredentialsForm
          action={signInWithPassword}
          passwordLabel="Password"
          passwordAutoComplete="current-password"
          label="Sign in"
        />
        <p className="text-sm font-semibold text-muted-foreground">
          <Link href="/forgot-password" className={textLinkClassName}>
            Forgot your password?
          </Link>
        </p>
      </section>
      <div
        role="separator"
        className="flex items-center gap-3 text-[0.8125rem] font-bold text-muted-foreground before:h-0.5 before:flex-1 before:bg-border after:h-0.5 after:flex-1 after:bg-border"
      >
        or
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-[0.9375rem] font-extrabold">With a magic link</h2>
        <MagicLinkForm
          label="Email me a magic link"
          redirectTo="/"
          variant="outline"
        />
      </section>
    </AuthCard>
  );
}
