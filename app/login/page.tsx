import Link from 'next/link';
import { MagicLinkForm } from '@/components/magic-link-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { PasswordSignInForm } from './password-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Use your password, or ask for a magic link by email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-medium">With a password</h2>
            <PasswordSignInForm />
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
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <p className="text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/signup" className="underline">
              Sign up with a password
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to the{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              privacy policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
