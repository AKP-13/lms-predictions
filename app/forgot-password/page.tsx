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
import { SET_PASSWORD_FORM } from '@/lib/credentials';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot your password?</CardTitle>
          <CardDescription>
            We email you a link. It signs you in and takes you to the form where
            you choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MagicLinkForm
            label="Email me a link"
            redirectTo={SET_PASSWORD_FORM}
          />
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
