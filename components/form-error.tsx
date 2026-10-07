import { CircleAlert, CircleCheck } from 'lucide-react';
import { toneClasses } from '@/components/ui/tones';
import { cn } from '@/lib/utils';

const TONES = {
  danger: {
    role: 'alert',
    Icon: CircleAlert,
    classes: toneClasses.destructive
  },
  success: {
    role: 'status',
    Icon: CircleCheck,
    classes: toneClasses.success
  }
} as const;

// The box of a message with an icon. Add a tone for its colours.
export const messageBoxClassName =
  'flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-sm font-bold leading-[1.1875rem]';

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
    <p role={role} className={cn(messageBoxClassName, classes)}>
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
