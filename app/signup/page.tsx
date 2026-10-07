import Link from 'next/link';
import { textLinkClassName } from '@/components/ui/button';
import { AuthCard, PrivacyNote } from '@/components/auth-card';
import { CredentialsForm } from '@/components/credentials-form';
import { MIN_PASSWORD_LENGTH } from '@/lib/credentials';
import { signUp } from './actions';

export default function SignUpPage() {
  return (
    <AuthCard
      title="Sign up"
      description="Choose a password. We will email you a link to verify your address before the password works."
      footer={
        <>
          <p className="text-sm font-semibold text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className={textLinkClassName}>
              Sign in
            </Link>
          </p>
          <PrivacyNote verb="signing up" />
        </>
      }
    >
      <CredentialsForm
        action={signUp}
        passwordLabel={`Password (${MIN_PASSWORD_LENGTH}+ characters)`}
        passwordAutoComplete="new-password"
        label="Sign up"
      />
    </AuthCard>
  );
}
