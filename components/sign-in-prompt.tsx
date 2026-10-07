import { textLinkClassName } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// What a signed-out visitor sees in place of a card's content.
export function SignInPrompt({ className }: { className?: string }) {
  return (
    <p className={cn('text-center', className)}>
      <a className={textLinkClassName} href="/login">
        Sign in to get started
      </a>
    </p>
  );
}
