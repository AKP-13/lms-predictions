import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
  disabledOptions?: string[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, id, name, options, disabledOptions, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-11 w-half rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
          className
        )}
        name={name}
        id={id}
        ref={ref}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            disabled={disabledOptions?.includes(option)}
          >
            {option}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };
