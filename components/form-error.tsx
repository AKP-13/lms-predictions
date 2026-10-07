import { CircleAlert, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES = {
  danger: {
    role: 'alert',
    Icon: CircleAlert,
    classes: 'bg-destructive-bg text-destructive'
  },
  success: {
    role: 'status',
    Icon: CircleCheck,
    classes: 'bg-success-bg text-success'
  }
} as const;

// The result of a form, in words and with an icon, not by colour only.
export function FormMessage({
  tone,
  children
}: {
  tone: keyof typeof TONES;
  children: React.ReactNode;
}) {
  const { role, Icon, classes } = TONES[tone];

  return (
    <p
      role={role}
      className={cn(
        'flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-sm font-bold leading-[1.1875rem]',
        classes
      )}
    >
      <Icon
        className="size-[1.125rem] shrink-0"
        strokeWidth={2.5}
        aria-hidden
      />
      {children}
    </p>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return <FormMessage tone="danger">{message}</FormMessage>;
}
