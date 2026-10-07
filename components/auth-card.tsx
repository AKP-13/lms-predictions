import Link from 'next/link';
import { textLinkClassName } from '@/components/ui/button';
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
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 py-8 md:justify-center md:p-8">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[0.875rem] bg-primary text-[0.8125rem] font-extrabold tracking-[0.02em] text-primary-foreground">
          LPS
        </span>
        <span className="text-lg font-extrabold">Last Player Standing</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 p-6 pb-5 md:p-8 md:pb-6">
          <CardTitle className="text-[1.625rem] leading-[1.875rem] md:text-[1.625rem] md:leading-[1.875rem]">
            {title}
          </CardTitle>
          <CardDescription className="text-[0.9375rem] leading-5">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-7 p-6 pt-0 md:p-8 md:pt-0">
          {children}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t-2 p-6 pt-5 md:p-8 md:pt-6">
          {footer}
        </CardFooter>
      </Card>
    </div>
  );
}

export function PrivacyNote({ verb }: { verb: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground">
      By {verb}, you agree to the{' '}
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className={textLinkClassName}
      >
        privacy policy
      </a>
      .
    </p>
  );
}
