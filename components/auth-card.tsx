import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

// The centred card that /login, /signup and /forgot-password share.
export function AuthCard({
  title,
  description,
  footer,
  children
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">{children}</CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          {footer}
        </CardFooter>
      </Card>
    </div>
  );
}

export function PrivacyNote({ verb }: { verb: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      By {verb}, you agree to the{' '}
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
  );
}
