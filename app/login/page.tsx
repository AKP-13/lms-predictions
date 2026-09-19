import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth';
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
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-medium">With a magic link</h2>
            <form
              action={async (formData) => {
                'use server';
                await signIn('resend', formData);
              }}
              className="flex flex-col gap-4"
            >
              <Input
                type="email"
                name="email"
                placeholder="Email"
                autoComplete="email"
                required
              />
              <Button type="submit" variant="outline" className="w-full">
                Email me a magic link
              </Button>
            </form>
          </section>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/signup" className="underline">
              Sign up with a password
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
