import { redirect } from 'next/navigation';
import { Check, KeyRound, Mail } from 'lucide-react';
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
import { initialsFor } from '@/lib/initials';
import { hasPassword } from '@/lib/users';
import { cn } from '@/lib/utils';
import { SetPasswordForm } from './set-password-form';

const PASSWORD_TIPS = [
  `At least ${MIN_PASSWORD_LENGTH} characters.`,
  'A phrase of a few words beats one short word.',
  'We refuse a password that has appeared in a data breach.'
];

type Tone = 'accent' | 'success' | 'secondary';

// The icon circle uses the same colours as the badge variant of that name.
const TONE_ICON_CLASSES: Record<Tone, string> = {
  accent: 'bg-accent-bg text-accent',
  success: 'bg-success-bg text-success',
  secondary: 'bg-chip text-muted-foreground'
};

export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const passwordIsSet = await hasPassword(userId);
  const email = session.user?.email;
  const passwordMethod = passwordIsSet
    ? {
        tone: 'success' as const,
        detail: 'You can sign in with your password.',
        status: (
          <>
            <Check className="size-3" strokeWidth={3} aria-hidden />
            Set
          </>
        )
      }
    : {
        tone: 'secondary' as const,
        detail: 'Set one below to sign in without waiting on an email.',
        status: 'Not set'
      };

  return (
    <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-4 md:gap-5 md:pt-4">
      <header className="flex items-center gap-3.5 px-1 md:gap-4">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-tint text-lg font-extrabold text-primary md:size-16 md:text-xl"
        >
          {initialsFor(session.user?.name, email)}
        </span>
        <div className="min-w-0">
          <h1 className="text-[1.625rem] font-extrabold leading-[1.875rem] md:text-[2.125rem] md:leading-10">
            Account
          </h1>
          <p className="mt-0.5 truncate text-[0.8125rem] font-semibold leading-[1.125rem] text-muted-foreground md:text-[0.9375rem] md:leading-5">
            {email}
          </p>
        </div>
      </header>

      <Card>
        <CardHeader className="space-y-1 p-5 pb-3 md:p-7 md:pb-3">
          <CardTitle>Auth methods</CardTitle>
          <CardDescription>
            How you can prove who you are at sign-in. You can use either one.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col p-5 pt-0 md:p-7 md:pt-0">
          <AuthMethod
            icon={<Mail className="size-[1.125rem]" strokeWidth={2.25} />}
            tone="accent"
            name="Magic link"
            detail="We email you a link that signs you in."
            status="Always on"
          />
          <AuthMethod
            icon={<KeyRound className="size-[1.125rem]" strokeWidth={2.25} />}
            name="Password"
            {...passwordMethod}
          />
        </CardContent>
      </Card>

      {/* The scroll margin clears the sticky header after the forgotten-password link. */}
      <Card id="set-password" className="scroll-mt-[4.5rem] md:scroll-mt-24">
        <CardHeader className="space-y-1 p-5 pb-0 md:p-7 md:pb-0">
          <CardTitle>Set a password</CardTitle>
          <CardDescription>
            {passwordIsSet
              ? 'Choose a new password. The old one stops working at once.'
              : 'Choose a password. Your magic link keeps working as well.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col p-5 pt-0 md:p-7 md:pt-0">
          <ul className="mb-[1.125rem] mt-3.5 flex flex-col gap-2 rounded-2xl bg-chip px-4 py-3.5">
            {PASSWORD_TIPS.map((tip) => (
              <li
                key={tip}
                className="flex items-baseline gap-2.5 text-[0.8125rem] font-semibold leading-[1.125rem] text-muted-foreground"
              >
                <span
                  aria-hidden
                  className="relative -top-0.5 size-1.5 shrink-0 rounded-full bg-primary"
                />
                {tip}
              </li>
            ))}
          </ul>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

function AuthMethod({
  icon,
  tone,
  name,
  detail,
  status
}: {
  icon: React.ReactNode;
  tone: Tone;
  name: string;
  detail: string;
  status: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-t py-3.5">
      <span
        aria-hidden
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          TONE_ICON_CLASSES[tone]
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.9375rem] font-extrabold leading-5">{name}</p>
        <p className="mt-0.5 text-[0.8125rem] font-semibold leading-[1.125rem] text-muted-foreground">
          {detail}
        </p>
      </div>
      <Badge variant={tone} className="shrink-0">
        {status}
      </Badge>
    </div>
  );
}
