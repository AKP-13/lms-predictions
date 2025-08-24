import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Sign in</CardDescription>
        </CardHeader>
        <CardFooter>
          <form
            action={async () => {
              'use server';
              await signIn('github', {
                redirectTo: '/'
              });
            }}
            className="w-full"
          >
            <Button className="w-full">Sign in with GitHub</Button>
          </form>
        </CardFooter>
        <CardFooter>
          <form
            action={async (formData) => {
              'use server';
              await signIn('resend', formData);
            }}
          >
            <input type="text" name="email" placeholder="Email" />
            <button type="submit">Signin with Resend</button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
