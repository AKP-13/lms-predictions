import { redirect } from 'next/navigation';
import { KeyRound, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { MIN_PASSWORD_LENGTH } from '@/lib/credentials';
import { hasPassword } from '@/lib/users';
import { SetPasswordForm } from './set-password-form';

export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const passwordIsSet = await hasPassword(userId);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-2">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">{session.user?.email}</p>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Auth methods</CardTitle>
          <CardDescription>
            How you can prove who you are at sign-in. You can use either one.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          <AuthMethod
            icon={<Mail className="h-4 w-4 text-muted-foreground" />}
            name="Magic link"
            detail="We email you a link that signs you in."
            badge={<Badge variant="secondary">Always on</Badge>}
          />
          <AuthMethod
            icon={<KeyRound className="h-4 w-4 text-muted-foreground" />}
            name="Password"
            detail={
              passwordIsSet
                ? 'You can sign in with your password.'
                : 'Set one below to sign in without waiting on an email.'
            }
            badge={
              passwordIsSet ? (
                <Badge variant="secondary">Set</Badge>
              ) : (
                <Badge variant="outline">Not set</Badge>
              )
            }
          />
        </CardContent>
      </Card>

      <Card id="set-password" className="scroll-mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Set a password</CardTitle>
          <CardDescription>
            {passwordIsSet
              ? 'Choose a new password. The old one stops working at once.'
              : 'Choose a password. Your magic link keeps working as well.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>At least {MIN_PASSWORD_LENGTH} characters.</li>
            <li>A phrase of a few words beats one short word.</li>
            <li>We refuse a password that has appeared in a data breach.</li>
          </ul>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

function AuthMethod({
  icon,
  name,
  detail,
  badge
}: {
  icon: React.ReactNode;
  name: string;
  detail: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <span className="mt-0.5">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium leading-none">{name}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <span className="ml-auto shrink-0">{badge}</span>
    </div>
  );
}
