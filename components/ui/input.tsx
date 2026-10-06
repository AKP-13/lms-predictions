import * as React from 'react';

import { cn } from '@/lib/utils';

// The input and the select share this look.
export const fieldClassName =
  'flex h-14 rounded-2xl border-2 border-input bg-card px-4 text-[1.0625rem] font-bold focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tint disabled:cursor-not-allowed disabled:opacity-50';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          fieldClassName,
          'w-full file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:font-semibold placeholder:text-muted-foreground',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
